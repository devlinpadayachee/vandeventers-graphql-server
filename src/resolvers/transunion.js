const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');
module.exports = {
    Mutation: {
        userEnquiry: async (parent, args, context, info) => {
            const {firstName, lastName, idNumber} = args;
            const data = await context.dataSources.transunionAPI.userEnquiry(firstName, lastName, idNumber);
            return data;
        },
    },
};