const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Category {
    id: ID!
    name: String!
    docClass: String!
    parent: ID
    createdBy: ID!
    createdAt: Float!
    updatedAt: Float!
  }

  extend type Query {
    category(id: ID!): Category
    categories(limit: Int!, skip: Int!, query: JSON!): CategoriesResponse!
  }

  extend type Mutation {
    createCategory(category: CategoryCreateInput): Category!
    updateCategory(category: CategoryUpdateInput): CategoryUpdatedResponse!
    deleteCategory(id: ID!): CategoryDeletedResponse!
  }

  input CategoryCreateInput {
    name: String!
    docClass: String!
    parent: ID
    createdBy: ID!
  }

  input CategoryUpdateInput {
    id: ID!
    name: String
    docClass: String
    parent: ID
  }

  type CategoriesResponse {
    records: [Category]!
    count: Int!
  }

  type CategoryUpdatedResponse {
    id: ID!
    updated: Boolean!
    category: Category
  }

  type CategoryDeletedResponse {
    id: ID!
    deleted: Boolean!
    category: Category
  }
`;

module.exports = typeDefs;
