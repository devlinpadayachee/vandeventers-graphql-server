const { gql } = require('apollo-server');

const typeDefs = gql`

    type Notification {
        id: ID!
        title: String!
        content: String!
        createdBy: ID!
        createdAt: Float!
        updatedAt: Float!
    }

    extend type Query {
        post(id:ID!): Notification
        posts(limit:Int!, skip:Int!, query: JSON!): NotificationsResponse!
    }

    extend type Mutation {
        createNotification(post: NotificationCreateInput): Notification!
        updateNotification(post: NotificationUpdateInput): UpdatedResponse! 
        deleteNotification(id: ID!): DeletedResponse! 
    }

    type NotificationsResponse {
        records: [Notification]!
        count: Int!
    }
    
    input NotificationCreateInput {
        title: String!
        content: String!
        createdBy: ID!
    }

    input NotificationUpdateInput {
        id: ID!
        title: String
        content: String
    }

    
`;

module.exports = typeDefs;