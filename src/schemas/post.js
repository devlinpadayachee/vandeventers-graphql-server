const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Post {
        id: ID!
        title: String!
        content: String!
        createdBy: ID!
        createdAt: Float!
        updatedAt: Float!
    }

    extend type Query {
        post(id:ID!): Post
        posts(limit:Int!, skip:Int!, query: JSON!): PostsResponse!
    }

    extend type Mutation {
        createPost(post: PostCreateInput): Post!
        updatePost(post: PostUpdateInput): PostUpdatedResponse! 
        deletePost(id: ID!): PostDeletedResponse! 
    }

    type PostsResponse {
        records: [Post]!
        count: Int!
    }
    
    input PostCreateInput {
        title: String!
        content: String!
        createdBy: ID!
    }

    input PostUpdateInput {
        id: ID!
        title: String
        content: String
    }

    type PostUpdatedResponse {
        id: ID!
        updated: Boolean!
        post: Post
    }

    type PostDeletedResponse {
        id: ID!
        deleted: Boolean!
        post: Post
    }

    
`;

module.exports = typeDefs;