const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');


const { GraphQLJSONObject } = require('graphql-type-json');
const GraphQLJSON = require('graphql-type-json');

module.exports = {
    Query: {
        ping: (parent, args, context, info) => {
            return "Im alive!";
        },
        mailTest: (parent, args, context, info) => {
            var job = context.dataSources.mailAPI.sendMail('devlinpadayachee@gmail.com', 'Test');
            return job;
        },
        fileUploadTest: (parent, args, context, info) => {
            var fileUrl = context.dataSources.firebaseAPI.uploadFile('txt', 'test/test', { working: true }, 'text/plain','Test');
            return fileUrl;
        },
    },
    Mutation: {
        changeConfig: (parent, args, context, info) => {
            return 'OK';
        },
    },
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,
};