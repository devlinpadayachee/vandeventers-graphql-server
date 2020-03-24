const { 
    ApolloServer,
    makeExecutableSchema,
    AuthenticationError
} = require('apollo-server');
const { applyMiddleware } = require ('graphql-middleware');
const BaseTypeDef = require ('./schemas/base');
const UserTypeDef = require ('./schemas/user');
const PostTypeDef = require ('./schemas/post');
const BaseResolver = require('./resolvers/base');
const UserResolver = require('./resolvers/user');
const PostResolver = require('./resolvers/post');
const permissions = require('./permissions');

const { createMongoInstance, verifyToken } = require('./utils');
const _ = require('lodash');
const mongoAPI = require('./datasources/mongo');

const mongoInstance = createMongoInstance();

const schema = applyMiddleware(
    makeExecutableSchema({
        typeDefs: [ BaseTypeDef, UserTypeDef, PostTypeDef ],
        resolvers: _.merge( BaseResolver, UserResolver, PostResolver )
    }),
    permissions
);

const server = new ApolloServer({
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
        mongoAPI: new mongoAPI({ mongoInstance })
    }),
});

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});