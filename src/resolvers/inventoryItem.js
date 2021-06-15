const {
  AuthenticationError,
  UserInputError,
  ApolloError,
} = require("apollo-server-express");
const mime = require("mime-types");
var validDataUrl = require("valid-data-url");

module.exports = {
  Query: {
    inventoryItem: async (parent, args, context, info) => {
      const inventoryItem = await context.dataSources.mongoAPI.inventoryItem(
        args.id
      );
      return inventoryItem;
    },
    inventoryItems: async (parent, args, context, info) => {
      console.log("got inventoryItems", args);
      const inventoryItems = await context.dataSources.mongoAPI.inventoryItems(
        args.limit,
        args.skip,
        args.query
      );
      return inventoryItems;
    },
  },
  Mutation: {
    createInventoryItem: async (parent, args, context, info) => {
      console.log("Creating InventoryItem", args);

      if (args.inventoryItem && args.inventoryItem.installationImage) {
        console.log("Uploading Installation Images");
        let mimeType = args?.inventoryItem?.installationImage.match(
          /[^:]\w+\/[\w-+\d.]+(?=;|,)/
        )[0];
        const fileUrl = await context.dataSources.firebaseAPI.uploadFile(
          mime.extension(mimeType),
          `inventory-items/${args.inventoryItem.serial}`,
          { working: true },
          mimeType,
          args.inventoryItem.installationImage
        );
        console.log(fileUrl);
        args.inventoryItem.installationImage = fileUrl;
      }
      const inventoryItem =
        await context.dataSources.mongoAPI.createInventoryItem(
          args.inventoryItem
        );
      if (inventoryItem) return inventoryItem;
      throw new ApolloError(
        "Could not create inventoryItem",
        "ACTION_NOT_COMPLETED",
        {}
      );
    },
    updateInventoryItem: async (parent, args, context, info) => {
      var isValidDataUrl = validDataUrl(args.inventoryItem.installationImage);
      console.log("Updating InventoryItem", args, isValidDataUrl);

      if (
        args.inventoryItem &&
        args.inventoryItem.installationImage &&
        isValidDataUrl
      ) {
        let mimeType = args?.inventoryItem?.installationImage.match(
          /[^:]\w+\/[\w-+\d.]+(?=;|,)/
        )[0];
        const fileUrl = await context.dataSources.firebaseAPI.uploadFile(
          mime.extension(mimeType),
          `inventory-items/${args.inventoryItem.serial}`,
          { working: true },
          mimeType,
          args.inventoryItem.installationImage
        );
        console.log(fileUrl);
        args.inventoryItem.installationImage = fileUrl;
      }

      const updated = await context.dataSources.mongoAPI.updateInventoryItem(
        args.inventoryItem
      );
      if (updated) return updated;
      throw new ApolloError(
        "Could not update inventoryItem",
        "ACTION_NOT_COMPLETED",
        {}
      );
    },
    deleteInventoryItem: async (parent, args, context, info) => {
      const deleted = await context.dataSources.mongoAPI.deleteInventoryItem(
        args.id
      );
      return deleted;
      throw new ApolloError(
        "Could not delete inventoryItem",
        "ACTION_NOT_COMPLETED",
        {}
      );
    },
  },
};
