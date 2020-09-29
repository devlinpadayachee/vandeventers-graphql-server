const { gql } = require('apollo-server-express');

const typeDefs = gql`

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

    type Payfast {
        merchantID: String!
        merchantKey: String!
        passPhrase: String!
        returnURL: String!
        cancelURL: String!
        notifyURL: String!
    }

    type Settings {
        payfast: Payfast!
        storeAddress: Address!
    }

    type Query {
        ping: String!
        mailTest: JSON!
        fileUploadTest: String!
        settings: Settings!
    }

    type Mutation {
        changeConfig: String!
    }
        
`;

module.exports = typeDefs;