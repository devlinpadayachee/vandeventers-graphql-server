const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type XpressDoxReturn {
        id: ID!
        order: ID!
        product: ID!
        data: JSON
        createdAt: Float!
        updatedAt: Float!
    }

    extend type Query {
        xpressDoxReturn(id:ID!): XpressDoxReturn
        xpressDoxReturns(limit:Int!, skip:Int!, query: JSON!): XpressDoxReturnsResponse!
        token: String!
        exploreRootFolder: JSON
    }

    extend type Mutation {
        createXpressDoxReturn(xpressDoxReturn: XpressDoxReturnCreateInput): XpressDoxReturn!
        updateXpressDoxReturn(xpressDoxReturn: XpressDoxReturnUpdateInput): XpressDoxReturnUpdatedResponse! 
        deleteXpressDoxReturn(id: ID!): XpressDoxReturnDeletedResponse! 
    }

    type XpressDoxReturnsResponse {
        records: [XpressDoxReturn]!
        count: Int!
    }
    
    input XpressDoxReturnCreateInput {
        id: ID!
        order: ID!
        product: ID!
        data: JSON
    }

    input XpressDoxReturnUpdateInput {
        id: ID!
        order: ID
        product: ID
        data: JSON
    }

    type XpressDoxReturnUpdatedResponse {
        id: ID!
        updated: Boolean!
        xpressDoxReturn: XpressDoxReturn
    }

    type XpressDoxReturnDeletedResponse {
        id: ID!
        deleted: Boolean!
        xpressDoxReturn: XpressDoxReturn
    }
`;

module.exports = typeDefs;