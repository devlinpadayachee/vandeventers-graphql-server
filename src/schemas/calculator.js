const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Calculator {
    id: ID!
    name: String!
    settings: JSON
    createdBy: ID!
    createdAt: Float!
    updatedAt: Float!
  }

  extend type Query {
    calculator(id: ID!): Calculator
    calculators(limit: Int!, skip: Int!, query: JSON!): CalculatorsResponse!
  }

  extend type Mutation {
    createCalculator(calculator: CalculatorCreateInput): Calculator!
    updateCalculator(
      calculator: CalculatorUpdateInput
    ): CalculatorUpdatedResponse!
    deleteCalculator(id: ID!): CalculatorDeletedResponse!
  }

  input CalculatorCreateInput {
    name: String!
    settings: JSON
    createdBy: ID!
  }

  input CalculatorUpdateInput {
    id: ID!
    settings: JSON
    type: String
  }

  type CalculatorsResponse {
    records: [Calculator]!
    count: Int!
  }

  type CalculatorUpdatedResponse {
    id: ID!
    updated: Boolean!
    calculator: Calculator
  }

  type CalculatorDeletedResponse {
    id: ID!
    deleted: Boolean!
    calculator: Calculator
  }
`;

module.exports = typeDefs;
