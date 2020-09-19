const { gql } = require('apollo-server-express');

const typeDefs = gql`

    extend type Query {
        token: String!
        exploreRootFolder: JSON
    }
`;

module.exports = typeDefs;