require('dotenv').config()
const { 
    ApolloServer,
    makeExecutableSchema,
    AuthenticationError
} = require('apollo-server-express');
const express = require('express');
const { applyMiddleware } = require ('graphql-middleware');
const BaseTypeDef = require ('./schemas/base');
const UserTypeDef = require ('./schemas/user');
const PostTypeDef = require ('./schemas/post');
const NotificationTypeDef = require ('./schemas/notification');
const ReasonTypeDef = require ('./schemas/reason');
const AttachmentTypeDef = require ('./schemas/attachment');
const SmappeeTypeDef = require ('./schemas/smappee');
const BaseResolver = require('./resolvers/base');
const UserResolver = require('./resolvers/user');
const PostResolver = require('./resolvers/post');
const NotificationResolver = require('./resolvers/notification');
const ReasonResolver = require('./resolvers/reason');
const AttachmentResolver = require('./resolvers/attachment');
const SmappeeResolver = require ('./resolvers/smappee');
const permissions = require('./permissions');

const { createMongoInstance, createMailerQueueInstance, getArenaConfig, verifyToken } = require('./utils');

const _ = require('lodash');
const mongoAPI = require('./datasources/mongo');
const smappeeAPI = require('./datasources/smappee');
const notificationAPI = require('./datasources/notification');
const mailAPI = require('./datasources/mail');

var mongoInstance;
var mailerQueueInstance;
(async() => {
    mongoInstance = await createMongoInstance();
    mailerQueueInstance = await createMailerQueueInstance();
})();



const schema = applyMiddleware(
    makeExecutableSchema({
        typeDefs: [ BaseTypeDef, UserTypeDef, PostTypeDef, NotificationTypeDef, ReasonTypeDef, AttachmentTypeDef, SmappeeTypeDef ],
        resolvers: _.merge( BaseResolver, UserResolver, PostResolver, NotificationResolver, ReasonResolver, AttachmentResolver, SmappeeResolver )
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
        smappeeAPI: new smappeeAPI({}),
        notificationAPI: new notificationAPI({}),
        mailAPI: new mailAPI({ mailerQueueInstance })
    })
});

const app = express();
app.use('/', getArenaConfig());
server.applyMiddleware({ app });

app.listen({ port: process.env.PORT || 4000 }, () =>
  console.log(`Server ready at ${process.env.APP_HOST_URL}`)
);