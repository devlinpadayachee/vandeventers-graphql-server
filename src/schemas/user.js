const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type User {
        id: ID!
        email: String!
        branch: ID
        branchName: String
        firstName: String!
        lastName: String!
        idNumber: String!
        fullAddress: String!
        telNumber: String
        title: String
        industry: String
        bio: String
        rating: Int
        role: Role!
        pushToken: String
        location: JSON
        metaData: JSON
        profilePicture: String
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

    extend type Mutation {
        login(email: String!, password: String!): LoginResponse!
        getResetPasswordLink(email: String!): JSON!
        resetPassword(resetToken: String!, password: String!): UserUpdatedResponse!
        sendUserToUserEmailMessage(to: ID!, from: ID!, message: String!): JSON!
        sendOTP(recipient: String!, message: String!): JSON!
        createUser(user: UserCreateInput): User!
        updateUser(user: UserUpdateInput): UserUpdatedResponse!
        deleteUser(id: ID!): UserDeletedResponse! 
    }

    input UserCreateInput {
        password: String!
        firstName: String!
        lastName: String!
        idNumber: String!
        fullAddress: String!
        telNumber: String!
        rating: Int
        email: String!
        bio: String
        title: String
        industry: String
        role: Role!
        branch: ID
    }

    input UserUpdateInput {
        id: ID!
        password: String
        firstName: String
        lastName: String
        idNumber: String
        fullAddress: String
        telNumber: String
        rating: Int
        email: String
        bio: String
        title: String
        industry: String
        role: Role
        branch: ID
        pushToken: String
        location: JSON
        metaData: JSON
        profilePicture: String
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