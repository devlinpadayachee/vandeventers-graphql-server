const { gql } = require('apollo-server');

const typeDefs = gql`

    scalar JSON
    scalar JSONObject

    enum Role {
        admin
        user
    }

    type UpdatedResponse {
        id: ID!
        updated: Boolean!
    }

    type DeletedResponse {
        id: ID!
        deleted: Boolean!
    }
        
`;

module.exports = typeDefs;