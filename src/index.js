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
const TicketTypeDef = require ('./schemas/ticket');
const ReasonTypeDef = require ('./schemas/reason');
const AttachmentTypeDef = require ('./schemas/attachment');
const ProductTypeDef = require ('./schemas/product');
const OrderTypeDef = require ('./schemas/order');
const XpressdoxTypeDef = require ('./schemas/xpressdox');
const BaseResolver = require('./resolvers/base');
const UserResolver = require('./resolvers/user');
const BranchResolver = require('./resolvers/branch');
const PostResolver = require('./resolvers/post');
const TicketResolver = require('./resolvers/ticket');
const ReasonResolver = require('./resolvers/reason');
const AttachmentResolver = require('./resolvers/attachment');
const ProductResolver = require('./resolvers/product');
const OrderResolver = require('./resolvers/order');
const XpressdoxResolver = require('./resolvers/xpressdox');
const permissions = require('./permissions');

const { createMongoInstance, createFirebaseInstance, createMailerQueueInstance, getArenaConfig, verifyToken } = require('./utils');

const _ = require('lodash');
const mongoAPI = require('./datasources/mongo');
const firebaseAPI = require('./datasources/firebase');
const notificationAPI = require('./datasources/notification');
const mailAPI = require('./datasources/mail');
const xpressdoxAPI = require('./datasources/xpressdox');

var mongoInstance;
var firebaseInstance;
var mailerQueueInstance;
(async() => {
    mongoInstance = await createMongoInstance();
    firebaseInstance = await createFirebaseInstance();
    mailerQueueInstance = await createMailerQueueInstance();;
})();

const schema = applyMiddleware(
    makeExecutableSchema({
        typeDefs: [BaseTypeDef, UserTypeDef, BranchTypeDef, PostTypeDef, TicketTypeDef, ReasonTypeDef, AttachmentTypeDef, ProductTypeDef, OrderTypeDef, XpressdoxTypeDef ],
        resolvers: _.merge(BaseResolver, UserResolver, BranchResolver, PostResolver, TicketResolver, ReasonResolver, AttachmentResolver, ProductResolver, OrderResolver, XpressdoxResolver )
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
        xpressdoxAPI: new xpressdoxAPI({}),
    })
});

const app = express();
app.use(bodyParser.json({ limit: '200mb' }));
app.use('/', getArenaConfig());
app.use('/test', function (req, res, next) {
    console.log('Received Request Type:', req.method)
    console.log('Received Request Body:', req.body)
    res.send('ok')
})
server.applyMiddleware({ app });

app.listen({ port: process.env.PORT || 4000 }, () => {
        console.log(`Server ready at ${process.env.APP_HOST_URL}`)
        console.log(`Server using db ${process.env.APP_DB}`)
    }
);