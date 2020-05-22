const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Enquiry {
        raw: JSON
        summaryCount: JSON
        success: Boolean!
    }

    extend type Mutation {
        userEnquiry(firstName:String!, lastName: String!, idNumber: String!): Enquiry!
    }
`;

module.exports = typeDefs;