const {
  AuthenticationError,
  UserInputError,
  ApolloError,
} = require("apollo-server-express");

module.exports = {
  Query: {
    calculator: async (parent, args, context, info) => {
      const calculator = await context.dataSources.mongoAPI.calculator(args.id);
      return calculator;
    },
    calculators: async (parent, args, context, info) => {
      console.log("Got a query for calculators");
      const calculators = await context.dataSources.mongoAPI.calculators(
        args.limit,
        args.skip,
        args.query
      );
      return calculators;
    },
  },
  Mutation: {
    createCalculator: async (parent, args, context, info) => {
      const calculator = await context.dataSources.mongoAPI.createCalculator(
        args.calculator
      );
      if (calculator) return calculator;
      throw new ApolloError(
        "Could not create calculator",
        "ACTION_NOT_COMPLETED",
        {}
      );
    },
    updateCalculator: async (parent, args, context, info) => {
      const updated = await context.dataSources.mongoAPI.updateCalculator(
        args.calculator
      );
      if (updated) return updated;
      throw new ApolloError(
        "Could not update calculator",
        "ACTION_NOT_COMPLETED",
        {}
      );
    },
    deleteCalculator: async (parent, args, context, info) => {
      const deleted = await context.dataSources.mongoAPI.deleteCalculator(
        args.id
      );
      return deleted;
      throw new ApolloError(
        "Could not delete calculator",
        "ACTION_NOT_COMPLETED",
        {}
      );
    },
  },
};
