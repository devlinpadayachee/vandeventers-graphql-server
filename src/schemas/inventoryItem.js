const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type InventoryItem {
    id: ID!
    serial: String!
    type: String!
    user: ID!
    supplierName: String
    supplierContactNumber: String
    installerName: String
    installerContactNumber: String
    notes: String
    damage: String
    installationImage: String
    invoiceDate: Float
    invoiceReference: String
    createdBy: ID!
    createdAt: Float!
    updatedAt: Float!
  }

  extend type Query {
    inventoryItem(id: ID!): InventoryItem
    inventoryItems(
      limit: Int!
      skip: Int!
      query: JSON!
    ): InventoryItemsResponse!
  }

  extend type Mutation {
    createInventoryItem(inventoryItem: InventoryItemCreateInput): InventoryItem!
    updateInventoryItem(
      inventoryItem: InventoryItemUpdateInput
    ): InventoryItemUpdatedResponse!
    deleteInventoryItem(id: ID!): InventoryItemDeletedResponse!
  }

  type InventoryItemsResponse {
    records: [InventoryItem]!
    count: Int!
  }

  input InventoryItemCreateInput {
    serial: String!
    type: String!
    user: ID!
    supplierName: String
    supplierContactNumber: String
    installerName: String
    installerContactNumber: String
    notes: String
    damage: String
    installationImage: String
    invoiceDate: Float
    invoiceReference: String
    createdBy: ID!
  }

  input InventoryItemUpdateInput {
    id: ID!
    serial: String
    type: String
    user: ID
    supplierName: String
    supplierContactNumber: String
    installerName: String
    installerContactNumber: String
    notes: String
    damage: String
    installationImage: String
    invoiceDate: Float
    invoiceReference: String
  }

  type InventoryItemUpdatedResponse {
    id: ID!
    updated: Boolean!
    inventoryItem: InventoryItem
  }

  type InventoryItemDeletedResponse {
    id: ID!
    deleted: Boolean!
    inventoryItem: InventoryItem
  }
`;

module.exports = typeDefs;
