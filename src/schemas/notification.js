const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Notification {
        id: ID!
        title: String!
        content: String!
        user: ID!
        reason: ID
        comment: String
        createdBy: ID!
        createdAt: Float!
        updatedAt: Float!
    }

    extend type Query {
        notification(id:ID!): Notification
        notifications(limit:Int!, skip:Int!, query: JSON!): NotificationsResponse!
    }

    extend type Mutation {
        createNotification(notification: NotificationCreateInput): Notification!
        updateNotification(notification: NotificationUpdateInput): UpdatedResponse! 
        deleteNotification(id: ID!): DeletedResponse! 
    }

    type NotificationsResponse {
        records: [Notification]!
        count: Int!
    }
    
    input NotificationCreateInput {
        title: String!
        content: String!
        user: ID!
        createdBy: ID!
    }

    input NotificationUpdateInput {
        id: ID!
        title: String
        content: String
        reason: ID
        comment: String
    }

    
`;

module.exports = typeDefs;