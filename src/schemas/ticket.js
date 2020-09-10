const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Ticket {
        id: ID!
        title: String!
        content: String!
        user: ID!
        userFullName: String
        assignee: ID
        assigneeFullName: String
        status: Status!
        reason: ID
        comment: String
        diagnostic: JSON
        images: JSON
        createdBy: ID!
        createdAt: Float!
        updatedAt: Float!
    }

    extend type Query {
        ticket(id:ID!): Ticket
        tickets(limit:Int!, skip:Int!, query: JSON!): TicketsResponse!
    }

    extend type Mutation {
        createTicket(ticket: TicketCreateInput): Ticket!
        updateTicket(ticket: TicketUpdateInput): TicketUpdatedResponse! 
        deleteTicket(id: ID!): TicketDeletedResponse! 
    }

    type TicketsResponse {
        records: [Ticket]!
        count: Int!
    }
    
    input TicketCreateInput {
        title: String!
        content: String!
        diagnostic: JSON
        images: JSON
        user: ID!
        status: Status!
        createdBy: ID!
    }

    input TicketUpdateInput {
        id: ID!
        title: String
        content: String
        assignee: ID
        status: Status
        reason: ID
        comment: String
        diagnostic: JSON
        images: JSON
    }

    type TicketUpdatedResponse {
        id: ID!
        updated: Boolean!
        ticket: Ticket
    }

    type TicketDeletedResponse {
        id: ID!
        deleted: Boolean!
        ticket: Ticket
    }

    
`;

module.exports = typeDefs;