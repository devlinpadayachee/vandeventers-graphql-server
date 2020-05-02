require('dotenv').config()
const { 
    ApolloServer,
    makeExecutableSchema,
    AuthenticationError
} = require('apollo-server-express');
const express = require('express');
const bodyParser = require ('body-parser');
const { applyMiddleware } = require ('graphql-middleware');
const BaseTypeDef = require ('./schemas/base');
const UserTypeDef = require ('./schemas/user');
const PostTypeDef = require ('./schemas/post');
const NotificationTypeDef = require ('./schemas/notification');
const ReasonTypeDef = require ('./schemas/reason');
const AttachmentTypeDef = require ('./schemas/attachment');
const BaseResolver = require('./resolvers/base');
const UserResolver = require('./resolvers/user');
const PostResolver = require('./resolvers/post');
const NotificationResolver = require('./resolvers/notification');
const ReasonResolver = require('./resolvers/reason');
const AttachmentResolver = require('./resolvers/attachment');
const permissions = require('./permissions');

const { createMongoInstance, createFirebaseInstance, createMailerQueueInstance, getArenaConfig, verifyToken } = require('./utils');

const _ = require('lodash');
const mongoAPI = require('./datasources/mongo');
const firebaseAPI = require('./datasources/firebase');
const notificationAPI = require('./datasources/notification');
const mailAPI = require('./datasources/mail');

var mongoInstance;
var firebaseInstance;
var mailerQueueInstance;
(async() => {
    mongoInstance = await createMongoInstance();
    firebaseInstance = await createFirebaseInstance();
    mailerQueueInstance = await createMailerQueueInstance();
})();



const schema = applyMiddleware(
    makeExecutableSchema({
        typeDefs: [ BaseTypeDef, UserTypeDef, PostTypeDef, NotificationTypeDef, ReasonTypeDef, AttachmentTypeDef ],
        resolvers: _.merge( BaseResolver, UserResolver, PostResolver, NotificationResolver, ReasonResolver, AttachmentResolver )
    }),
    permissions
);

const server = new ApolloServer({
    introspection: true,
    playground: true,
    schema,
    context: async ({ req }) => {
        let user = null
        if (req.headers.authorization && req.headers.authorization.indexOf('Bearer ') !== -1){    
            const tokenWithBearer = req.headers.authorization || ''
            const token = tokenWithBearer.split(' ')[1]
            let parsedToken = await verifyToken(token);
            user = parsedToken;
        }
        return { user }
    },
    dataSources: () => ({
        mongoAPI: new mongoAPI({ mongoInstance }),
        firebaseAPI: new firebaseAPI({ firebaseInstance }),
        notificationAPI: new notificationAPI({}),
        mailAPI: new mailAPI({ mailerQueueInstance })
    })
});

const app = express();
app.use(bodyParser.json({ limit: '200mb' }));
app.use('/', getArenaConfig());
server.applyMiddleware({ app });

app.listen({ port: process.env.PORT || 4000 }, () =>
  console.log(`Server ready at ${process.env.APP_HOST_URL}`)
);