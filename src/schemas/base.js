const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Query {
        ping: String!
        mailTest: JSON!
    }

    scalar JSON
    scalar JSONObject

    enum Role {
        admin
        user
    }

    enum AttachmentType {
        image
    }
   
    type AckResponse {
        success: Boolean!
    }
        
`;

module.exports = typeDefs;