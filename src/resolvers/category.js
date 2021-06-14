const {
  AuthenticationError,
  UserInputError,
  ApolloError,
} = require("apollo-server-express");

module.exports = {
  Query: {
    category: async (parent, args, context, info) => {
      const category = await context.dataSources.mongoAPI.category(args.id);
      return category;
    },
    categories: async (parent, args, context, info) => {
      console.log("Got a query for categories");
      const categories = await context.dataSources.mongoAPI.categories(
        args.limit,
        args.skip,
        args.query
      );
      return categories;
    },
  },
  Mutation: {
    createCategory: async (parent, args, context, info) => {
      const category = await context.dataSources.mongoAPI.createCategory(
        args.category
      );
      if (category) return category;
      throw new ApolloError(
        "Could not create category",
        "ACTION_NOT_COMPLETED",
        {}
      );
    },
    updateCategory: async (parent, args, context, info) => {
      const updated = await context.dataSources.mongoAPI.updateCategory(
        args.category
      );
      if (updated) return updated;
      throw new ApolloError(
        "Could not update category",
        "ACTION_NOT_COMPLETED",
        {}
      );
    },
    deleteCategory: async (parent, args, context, info) => {
      const deleted = await context.dataSources.mongoAPI.deleteCategory(
        args.id
      );
      return deleted;
      throw new ApolloError(
        "Could not delete category",
        "ACTION_NOT_COMPLETED",
        {}
      );
    },
  },
};
