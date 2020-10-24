const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Product {
        id: ID!
        title: String!
        content: String!
        featurePicture: String
        distiPicture: String
        category: String
        price: Float
        tagIDs: [ID]
        tags: [Tag]
        digitalItem: String
        disclaimer: String
        createdBy: ID!
        createdAt: Float!
        updatedAt: Float!
    }

    extend type Query {
        product(id:ID!): Product
        products(limit:Int!, skip:Int!, query: JSON!): ProductsResponse!
    }

    extend type Mutation {
        createProduct(product: ProductCreateInput): Product!
        updateProduct(product: ProductUpdateInput): ProductUpdatedResponse! 
        deleteProduct(id: ID!): ProductDeletedResponse! 
    }

    type ProductsResponse {
        records: [Product]!
        count: Int!
    }
    
    input ProductCreateInput {
        title: String!
        content: String!
        featurePicture: String
        distiPicture: String
        category: String!
        price: Float!
        tagIDs: [ID]
        digitalItem: String
        disclaimer: String
        createdBy: ID!
    }

    input ProductUpdateInput {
        id: ID!
        title: String
        content: String
        featurePicture: String
        distiPicture: String
        category: String
        price: Float
        tagIDs: [ID]
        digitalItem: String
        disclaimer: String
    }

    type ProductUpdatedResponse {
        id: ID!
        updated: Boolean!
        product: Product
    }

    type ProductDeletedResponse {
        id: ID!
        deleted: Boolean!
        product: Product
    }

    
`;

module.exports = typeDefs;