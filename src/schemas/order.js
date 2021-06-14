const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Order {
    id: ID!
    totalAmount: Float!
    products: JSON!
    deliveryDate: Float
    deliveryAddress: String
    payment: String
    payfastRef: String
    status: String
    createdBy: ID!
    createdAt: Float!
    updatedAt: Float!
  }

  extend type Query {
    order(id: ID!): Order
    orders(limit: Int!, skip: Int!, query: JSON!): OrdersResponse!
  }

  extend type Mutation {
    createOrder(order: OrderCreateInput): Order!
    updateOrder(order: OrderUpdateInput): OrderUpdatedResponse!
    deleteOrder(id: ID!): OrderDeletedResponse!
  }

  input OrderCreateInput {
    totalAmount: Float!
    products: JSON!
    deliveryDate: Float
    deliveryAddress: String
    payment: String
    status: String
    createdBy: ID!
  }

  input OrderUpdateInput {
    id: ID!
    totalAmount: Float
    products: JSON
    deliveryDate: Float
    deliveryAddress: String
    payment: String
    payfastRef: String
    status: String
  }

  type OrdersResponse {
    records: [Order]!
    count: Int!
  }

  type OrderUpdatedResponse {
    id: ID!
    updated: Boolean!
    order: Order
  }

  type OrderDeletedResponse {
    id: ID!
    deleted: Boolean!
    order: Order
  }
`;

module.exports = typeDefs;
