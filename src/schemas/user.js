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
        ping: String!
        me: User
        user(id:ID!): User
        users(limit:Int!, skip:Int!, query: JSON!): UsersResponse!
    }

    type Mutation {
        login(email: String!, password: String!): LoginResponse!
        createUser(user: UserCreateInput): User!
        updateUser(user: UserUpdateInput): UpdatedResponse! 
        deleteUser(id: ID!): DeletedResponse! 
    }

    enum Role {
        admin
        user
    }

    input UserCreateInput {
        username: String!
        password: String!
        email: String!
        role: Role!
    }

    input UserUpdateInput {
        id: ID!
        username: String
        password: String
        email: String
        role: Role
    }

    type UsersResponse {
        records: [User]!
        count: Int!
    }
    
    type LoginResponse {
        user: User
        token: String
    }

`;

module.exports = typeDefs;