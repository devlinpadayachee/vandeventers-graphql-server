const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server');


const { GraphQLJSONObject } = require('graphql-type-json');
const GraphQLJSON = require('graphql-type-json');

module.exports = {
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,
};