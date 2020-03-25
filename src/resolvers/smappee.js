const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server');

module.exports = {
    Query: {
        token: async (parent, args, context, info) => {
            const token = await context.dataSources.smappeeAPI.token();
            return token;
        },
        serviceLocation: async (parent, args, context, info) => {
            const serviceLocation = await context.dataSources.smappeeAPI.serviceLocation(args.serviceLocationId);
            return serviceLocation;
        },
        serviceLocationElectricityConsumption: async (parent, args, context, info) => {
            const serviceLocationElectricityConsumption = await context.dataSources.smappeeAPI.serviceLocationElectricityConsumption(args.serviceLocationId, args.aggregation, args.from, args.to );
            return serviceLocationElectricityConsumption;
        },
        serviceLocationCostAnalysis: async (parent, args, context, info) => {
            const serviceLocationCostAnalysis = await context.dataSources.smappeeAPI.serviceLocationCostAnalysis(args.serviceLocationId, args.aggregation, args.from, args.to );
            return serviceLocationCostAnalysis;
        },
        serviceLocations: async (parent, args, context, info) => {
            const serviceLocations = await context.dataSources.smappeeAPI.serviceLocations();
            return serviceLocations;
        },
    },
};