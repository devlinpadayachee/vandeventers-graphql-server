const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Notification {
        id: ID!
        title: String!
        content: String!
        user: ID!
        assignee: ID
        status: Status!
        reason: ID
        comment: String
        diagnostic: JSON
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
        updateNotification(notification: NotificationUpdateInput): NotificationUpdatedResponse! 
        deleteNotification(id: ID!): NotificationDeletedResponse! 
    }

    type NotificationsResponse {
        records: [Notification]!
        count: Int!
    }
    
    input NotificationCreateInput {
        title: String!
        content: String!
        diagnostic: JSON
        user: ID!
        status: Status!
        createdBy: ID!
    }

    input NotificationUpdateInput {
        id: ID!
        title: String
        content: String
        assignee: ID
        status: Status
        reason: ID
        comment: String
        diagnostic: JSON
    }

    type NotificationUpdatedResponse {
        id: ID!
        updated: Boolean!
        notification: Notification
    }

    type NotificationDeletedResponse {
        id: ID!
        deleted: Boolean!
        notification: Notification
    }

    
`;

module.exports = typeDefs;