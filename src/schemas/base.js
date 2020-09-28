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
        closed
        resolved
    }

    enum AttachmentType {
        image
    }
   
    type AckResponse {
        success: Boolean!
    }

    type Address {
        addressLine1: String!
        addressLine2: String
        city: String!
        country: String!
        postalCode: String!
    }
        
`;

module.exports = typeDefs;