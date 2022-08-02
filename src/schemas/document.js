const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Document {
    id: ID!
    name: String!
    user: ID!
    docClass: String!
    category: ID
    categoryName: String
    documentLink: String!
    documentFileName: String!
    createdBy: ID!
    createdAt: Float!
    updatedAt: Float!
  }

  extend type Query {
    document(id: ID!): Document
    documents(limit: Int!, skip: Int!, query: JSON!): DocumentsResponse!
  }

  extend type Mutation {
    createDocument(document: DocumentCreateInput): Document!
    updateDocument(document: DocumentUpdateInput): DocumentUpdatedResponse!
    deleteDocument(id: ID!): DocumentDeletedResponse!
  }

  type DocumentsResponse {
    records: [Document]!
    count: Int!
  }

  input DocumentCreateInput {
    name: String!
    user: ID!
    docClass: String!
    category: ID
    documentLink: String!
    documentFileName: String!
    createdBy: ID!
  }

  input DocumentUpdateInput {
    id: ID!
    name: String
    user: ID
    docClass: String
    category: ID
    documentLink: String
    documentFileName: String
  }

  type DocumentUpdatedResponse {
    id: ID!
    updated: Boolean!
    document: Document
  }

  type DocumentDeletedResponse {
    id: ID!
    deleted: Boolean!
    document: Document
  }
`;

module.exports = typeDefs;
