const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');
module.exports = {
    Query: {
        token: async (parent, args, context, info) => {
            const token = await context.dataSources.xpressdoxAPI.token();
            return token;
        },
    },
};