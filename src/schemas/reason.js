const { gql } = require('apollo-server');

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
        updateReason(reason: ReasonUpdateInput): UpdatedResponse! 
        deleteReason(id: ID!): DeletedResponse! 
    }

    type ReasonsResponse {
        records: [Reason]!
        count: Int!
    }
    
    input ReasonCreateInput {
        explanation: String!
        createdBy: ID!
    }

    input ReasonUpdateInput {
        id: ID!
        explanation: String!
    }
`;

module.exports = typeDefs;