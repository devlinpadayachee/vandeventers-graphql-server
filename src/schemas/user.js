const { gql } = require('apollo-server');

const typeDefs = gql`

    type User {
        id: ID!
        username: String!
        email: String!
        role: Role!
        createdAt: Float!
        updatedAt: Float!
    }

    type Query {
        me: User
        user(id:ID!): User
        users(limit:Int!, skip:Int!, query: JSON!): UsersResponse!
    }

    type Mutation {
        login(email: String!, password: String!): LoginResponse!
        createUser(username: String!, password: String!, email: String!, role: Role! ): User 
        updateUser(user: UserUpdateInput): UpdatedResponse! 
        deleteUser(id: ID!): DeletedResponse! 
    }

    enum Role {
        admin
        user
    }

    input UserUpdateInput {
        id: ID!
        username: String
        password: String
        email: String
        role: Role
    }

    type UsersResponse {
        users: [User]!
        userCount: Int!
    }
    
    type LoginResponse {
        user: User
        token: String
    }

    type UpdatedResponse {
        id: ID!
        updated: Boolean!
        user: User!
    }

    type DeletedResponse {
        id: ID!
        deleted: Boolean!
    }
    
`;

module.exports = typeDefs;