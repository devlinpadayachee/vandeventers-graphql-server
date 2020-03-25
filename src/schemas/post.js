const { gql } = require('apollo-server');

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
        updatePost(post: PostUpdateInput): UpdatedResponse! 
        deletePost(id: ID!): DeletedResponse! 
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

    type PostsResponse {
        records: [Post]!
        count: Int!
    }
    
`;

module.exports = typeDefs;