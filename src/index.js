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
const BranchTypeDef = require ('./schemas/branch');
const PostTypeDef = require ('./schemas/post');
const NotificationTypeDef = require ('./schemas/notification');
const ReasonTypeDef = require ('./schemas/reason');
const AttachmentTypeDef = require ('./schemas/attachment');
const SmappeeTypeDef = require ('./schemas/smappee');
const TransunionTypeDef = require ('./schemas/transunion');
const BaseResolver = require('./resolvers/base');
const UserResolver = require('./resolvers/user');
const BranchResolver = require('./resolvers/branch');
const PostResolver = require('./resolvers/post');
const NotificationResolver = require('./resolvers/notification');
const ReasonResolver = require('./resolvers/reason');
const AttachmentResolver = require('./resolvers/attachment');
const SmappeeResolver = require ('./resolvers/smappee');
const TransunionResolver = require ('./resolvers/transunion');
const permissions = require('./permissions');

const { createMongoInstance, createFirebaseInstance, createMailerQueueInstance, createTransunionInstance, getArenaConfig, verifyToken } = require('./utils');

const _ = require('lodash');
const mongoAPI = require('./datasources/mongo');
const firebaseAPI = require('./datasources/firebase');
const notificationAPI = require('./datasources/notification');
const mailAPI = require('./datasources/mail');
const smappeeAPI = require('./datasources/smappee');
const transunionAPI = require('./datasources/transunion');

var mongoInstance;
var firebaseInstance;
var mailerQueueInstance;
var transunionInstance;
(async() => {
    mongoInstance = await createMongoInstance();
    firebaseInstance = await createFirebaseInstance();
    mailerQueueInstance = await createMailerQueueInstance();
    transunionInstance = await createTransunionInstance();
})();

const schema = applyMiddleware(
    makeExecutableSchema({
        typeDefs: [ BaseTypeDef, UserTypeDef, BranchTypeDef, PostTypeDef, NotificationTypeDef, ReasonTypeDef, AttachmentTypeDef, SmappeeTypeDef, TransunionTypeDef ],
        resolvers: _.merge( BaseResolver, UserResolver, BranchResolver, PostResolver, NotificationResolver, ReasonResolver, AttachmentResolver, SmappeeResolver, TransunionResolver )
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
        mailAPI: new mailAPI({ mailerQueueInstance }),
        smappeeAPI: new smappeeAPI({}),
        transunionAPI: new transunionAPI({ transunionInstance }),
    })
});

const app = express();
app.use(bodyParser.json({ limit: '200mb' }));
app.use('/', getArenaConfig());
server.applyMiddleware({ app });

app.listen({ port: process.env.PORT || 4000 }, () =>
  console.log(`Server ready at ${process.env.APP_HOST_URL}`)
);