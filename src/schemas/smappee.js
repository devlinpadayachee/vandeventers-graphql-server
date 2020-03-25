const { gql } = require('apollo-server');

const typeDefs = gql`

    type ServiceLocation {
        serviceLocationId: ID!
        serviceLocationUuid: ID!
        name: String!
        lon: String
        lat: String
        electricityCost: String
        electricityCurrency: String
        timezone: String
        deviceSerialNumber: String
        appliances: JSON
        actuators: JSON
        sensors: JSON
        monitors: JSON
        channelsConfiguration: JSON
    }

    extend type Query {
        token: String!
        serviceLocation(serviceLocationId:ID!): ServiceLocation!
        serviceLocations: ServiceLocationsResponse!
        serviceLocationElectricityConsumption(serviceLocationId:ID!, aggregation: Int!, from: Float!, to: Float! ): JSON!
        serviceLocationCostAnalysis(serviceLocationId:ID!, aggregation: Int!, from: Float!, to: Float! ): JSON!
    }

    type ServiceLocationsResponse {
        records: [ServiceLocation]!
        count: Int!
    }
`;

module.exports = typeDefs;