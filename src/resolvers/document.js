const {
  AuthenticationError,
  UserInputError,
  ApolloError,
} = require("apollo-server-express");
const mime = require("mime-types");
var validDataUrl = require("valid-data-url");

module.exports = {
  Query: {
    document: async (parent, args, context, info) => {
      const document = await context.dataSources.mongoAPI.document(args.id);
      return document;
    },
    documents: async (parent, args, context, info) => {
      console.log("got documents", args);
      const documents = await context.dataSources.mongoAPI.documents(
        args.limit,
        args.skip,
        args.query
      );
      return documents;
    },
  },
  Mutation: {
    createDocument: async (parent, args, context, info) => {
      console.log("Creating Document", args);
      if (args.document.category !== "Videos") {
        console.log("Uploading non Video File to FireBase");
        let mimeType = args?.document?.documentLink.match(
          /[^:]\w+\/[\w-+\d.]+(?=;|,)/
        )[0];
        const fileUrl = await context.dataSources.firebaseAPI.uploadFile(
          mime.extension(mimeType),
          `documents/${args.document.docClass}/${args.document.category}/${args.document.name}`,
          { working: true },
          mimeType,
          args.document.documentLink
        );
        console.log(fileUrl);
        args.document.documentLink = fileUrl;
      }
      const document = await context.dataSources.mongoAPI.createDocument(
        args.document
      );
      if (document) return document;
      throw new ApolloError(
        "Could not create document",
        "ACTION_NOT_COMPLETED",
        {}
      );
    },
    updateDocument: async (parent, args, context, info) => {
      var isValidDataUrl = validDataUrl(args.document.documentLink);
      console.log("Updating Document", args, isValidDataUrl);
      if (args.document.category !== "Videos" && isValidDataUrl) {
        console.log("Uploading non Video File to FireBase");
        let mimeType = args?.document?.documentLink.match(
          /[^:]\w+\/[\w-+\d.]+(?=;|,)/
        )[0];
        const fileUrl = await context.dataSources.firebaseAPI.uploadFile(
          mime.extension(mimeType),
          `documents/${args.document.docClass}/${args.document.category}/${args.document.name}`,
          { working: true },
          mimeType,
          args.document.documentLink
        );
        console.log(fileUrl);
        args.document.documentLink = fileUrl;
      }
      const updated = await context.dataSources.mongoAPI.updateDocument(
        args.document
      );
      if (updated) return updated;
      throw new ApolloError(
        "Could not update document",
        "ACTION_NOT_COMPLETED",
        {}
      );
    },
    deleteDocument: async (parent, args, context, info) => {
      const deleted = await context.dataSources.mongoAPI.deleteDocument(
        args.id
      );
      return deleted;
      throw new ApolloError(
        "Could not delete document",
        "ACTION_NOT_COMPLETED",
        {}
      );
    },
  },
};
