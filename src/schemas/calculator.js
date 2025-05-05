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
    updateCalculator(calculator: CalculatorUpdateInput): CalculatorUpdatedResponse!
    deleteCalculator(id: ID!): CalculatorDeletedResponse!
    sendCalculatorResults(to: String!, subject: String!, results: JSON!): SendCalculatorResultsResponse!
    generateCalculatorPDF(results: JSON!): GenerateCalculatorPDFResponse!
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

  type SendCalculatorResultsResponse {
    success: Boolean!
    message: String
  }

  type GenerateCalculatorPDFResponse {
    success: Boolean!
    pdfBase64: String
    message: String
  }
`;

module.exports = typeDefs;
