require('dotenv').config()
const { 
    ApolloServer,
    makeExecutableSchema,
    AuthenticationError
} = require('apollo-server-express');
const express = require('express');
const bodyParser = require ('body-parser');
require('body-parser-xml')(bodyParser);
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
const TagTypeDef = require ('./schemas/tag');
const XpressdoxReturnTypeDef = require ('./schemas/xpressdoxReturn');
const BaseResolver = require('./resolvers/base');
const UserResolver = require('./resolvers/user');
const BranchResolver = require('./resolvers/branch');
const PostResolver = require('./resolvers/post');
const TicketResolver = require('./resolvers/ticket');
const ReasonResolver = require('./resolvers/reason');
const AttachmentResolver = require('./resolvers/attachment');
const ProductResolver = require('./resolvers/product');
const OrderResolver = require('./resolvers/order');
const TagResolver = require('./resolvers/tag');
const XpressdoxReturnResolver = require('./resolvers/xpressdoxReturn');
const permissions = require('./permissions');

const { createMongoInstance, createFirebaseInstance, createMailerQueueInstance, getArenaConfig, verifyToken, sanitizeXpressDoxXML } = require('./utils');

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
        typeDefs: [BaseTypeDef, UserTypeDef, BranchTypeDef, PostTypeDef, TicketTypeDef, ReasonTypeDef, AttachmentTypeDef, ProductTypeDef, OrderTypeDef, TagTypeDef, XpressdoxReturnTypeDef ],
        resolvers: _.merge(BaseResolver, UserResolver, BranchResolver, PostResolver, TicketResolver, ReasonResolver, AttachmentResolver, ProductResolver, OrderResolver, TagResolver, XpressdoxReturnResolver )
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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.xml());
app.use('/', getArenaConfig());
app.use('/test', function (req, res, next) {
    console.log('Received Request Type:', req.method);
    console.log('Received Request Body:', req.body);
    res.send('ok');
});
app.use('/xpressDoxReturnURL', async function (req, res, next) {
    // console.log('Received Request Type:', req.method);
    // console.log('Received Request Body:', req.body);
    let sanitizedData = await sanitizeXpressDoxXML(req.body.xdResultData);
    console.error('\x1b[35m', req.query);
    console.log('\x1b[36m%s\x1b[0m', JSON.stringify(sanitizedData, null, 4));
    try {
        const order = req.query && req.query.order ? req.query.order : null;
        const product = req.query && req.query.product ? req.query.product : null;
        console.log(mongoInstance);
        const xpressDoxReturn = await mongoInstance.XpressDoxReturn.create({ order, product, data: sanitizedData });
        // return xpressDoxReturn ? xpressDoxReturn : null;
        if(xpressDoxReturn) {
            res.redirect(301, `https://nla-graphql-client.herokuapp.com/xpressdox/success/${order}/${product}/`);
            // res.send(xpressDoxReturn);
        } else {
            res.status(400).send('Oops Something went wrong, could not create a xpressDoxReturn record'); 
        }
    } catch (e) {
        console.log('Oops Something went wrong, could not create a xpressDoxReturn record', e);
        res.status(400).send('Oops Something went wrong, could not create a xpressDoxReturn record');
    }
});
app.use('/payfastNotifyURL', function (req, res, next) {
    console.log('Received Request Type:', req.method);
    console.log('Received Request Body:', req);
    res.send('ok');
});
server.applyMiddleware({ app });

app.listen({ port: process.env.PORT || 4000 }, () => {
        console.log(`Server ready at ${process.env.APP_HOST_URL}`)
        console.log(`Server using db ${process.env.APP_DB}`)
    }
);