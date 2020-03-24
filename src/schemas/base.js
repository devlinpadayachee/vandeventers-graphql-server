const { gql } = require('apollo-server');

const typeDefs = gql`

    scalar JSON
    scalar JSONObject

    type UpdatedResponse {
        id: ID!
        updated: Boolean!
        user: User!
    }

    type DeletedResponse {
        id: ID!
        deleted: Boolean!
    }
        
`;

module.exports = typeDefs;