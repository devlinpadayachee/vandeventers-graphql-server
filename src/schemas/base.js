const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Query {
        ping: String!
        mailTest: JSON!
        fileUploadTest: String!
    }

    type Mutation {
        changeConfig: String!
    }

    scalar JSON
    scalar JSONObject

    enum Role {
        admin
        consultant
        user
    }

    enum Status {
        open
        declined
        closed
        resolved
    }

    enum AttachmentType {
        image
    }
   
    type AckResponse {
        success: Boolean!
    }
        
`;

module.exports = typeDefs;