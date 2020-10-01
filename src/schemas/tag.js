const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Tag {
        id: ID!
        name: String!
        type: TagType!
        createdBy: ID!
        createdAt: Float!
        updatedAt: Float!
    }

    extend type Query {
        tag(id:ID!): Tag
        tags(limit:Int!, skip:Int!, query: JSON!): TagsResponse!
    }

    extend type Mutation {
        createTag(tag: TagCreateInput): Tag!
        updateTag(tag: TagUpdateInput): TagUpdatedResponse! 
        deleteTag(id: ID!): TagDeletedResponse! 
    }
    
    input TagCreateInput {
        name: String!
        type: String!
        createdBy: ID!
    }

    input TagUpdateInput {
        id: ID!
        name: String
        type: String
    }

    type TagsResponse {
        records: [Tag]!
        count: Int!
    }

    type TagUpdatedResponse {
        id: ID!
        updated: Boolean!
        tag: Tag
    }

    type TagDeletedResponse {
        id: ID!
        deleted: Boolean!
        tag: Tag
    }
`;

module.exports = typeDefs;