const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type User {
        id: ID!
        username: String!
        email: String!
        role: Role!
        pushToken: String
        location: JSON
        serviceLocations: JSON
        metaData: JSON
        profilePicture: ID
        homePicture: ID
        loginCounter: Int
        resetToken: String
        createdAt: Float!
        updatedAt: Float!
    }

    extend type Query {
        me: User
        user(id:ID!): User
        users(limit:Int!, skip:Int!, query: JSON!): UsersResponse!
    }

    type Mutation {
        login(email: String!, password: String!): LoginResponse!
        getResetPasswordLink(email: String!): JSON!
        resetPassword(resetToken: String!, password: String!): UserUpdatedResponse!
        createUser(user: UserCreateInput): User!
        updateUser(user: UserUpdateInput): UserUpdatedResponse! 
        deleteUser(id: ID!): UserDeletedResponse! 
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
        pushToken: String
        location: JSON
        serviceLocations: JSON
        metaData: JSON
        profilePicture: ID
        homePicture: ID
        loginCounter: Int
        resetToken: String
    }

    type UsersResponse {
        records: [User]!
        count: Int!
    }

    type UserUpdatedResponse {
        id: ID!
        updated: Boolean!
        user: User
    }

    type UserDeletedResponse {
        id: ID!
        deleted: Boolean!
        user: User
    }

    type LoginResponse {
        user: User
        token: String
    }

`;

module.exports = typeDefs;