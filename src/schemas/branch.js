const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Branch {
        id: ID!
        name: String!
        createdBy: ID!
        createdAt: Float!
        updatedAt: Float!
    }

    extend type Query {
        branch(id:ID!): Branch
        branches(limit:Int!, skip:Int!, query: JSON!): BranchesResponse!
    }

    extend type Mutation {
        createBranch(branch: BranchCreateInput): Branch!
        updateBranch(branch: BranchUpdateInput): BranchUpdatedResponse! 
        deleteBranch(id: ID!): BranchDeletedResponse! 
    }
    
    input BranchCreateInput {
        name: String!
        createdBy: ID!
    }

    input BranchUpdateInput {
        id: ID!
        name: String!
    }

    type BranchesResponse {
        records: [Branch]!
        count: Int!
    }

    type BranchUpdatedResponse {
        id: ID!
        updated: Boolean!
        branch: Branch
    }

    type BranchDeletedResponse {
        id: ID!
        deleted: Boolean!
        branch: Branch
    }
`;

module.exports = typeDefs;