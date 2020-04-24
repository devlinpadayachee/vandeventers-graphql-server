const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Reason {
        id: ID!
        explanation: String!
        createdBy: ID!
        createdAt: Float!
        updatedAt: Float!
    }

    extend type Query {
        reason(id:ID!): Reason
        reasons(limit:Int!, skip:Int!, query: JSON!): ReasonsResponse!
    }

    extend type Mutation {
        createReason(reason: ReasonCreateInput): Reason!
        updateReason(reason: ReasonUpdateInput): ReasonUpdatedResponse! 
        deleteReason(id: ID!): ReasonDeletedResponse! 
    }
    
    input ReasonCreateInput {
        explanation: String!
        createdBy: ID!
    }

    input ReasonUpdateInput {
        id: ID!
        explanation: String!
    }

    type ReasonsResponse {
        records: [Reason]!
        count: Int!
    }

    type ReasonUpdatedResponse {
        id: ID!
        updated: Boolean!
        reason: Reason
    }

    type ReasonDeletedResponse {
        id: ID!
        deleted: Boolean!
        reason: Reason
    }
`;

module.exports = typeDefs;