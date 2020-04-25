const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');

module.exports = {
    Query: {
        attachment: async (parent, args, context, info) => {
            const attachment = await context.dataSources.mongoAPI.attachment(args.id);
            return attachment;
        },
        attachments: async (parent, args, context, info) => {
            const attachments = await context.dataSources.mongoAPI.attachments(args.limit, args.skip, args.query);
            return attachments;
        }
    },
    Mutation: {
        createAttachment: async (parent, args, context, info) => {
            const attachment = await context.dataSources.mongoAPI.createAttachment(args.attachment);
            if (attachment) return attachment;
            throw new ApolloError('Could not create attachment', 'ACTION_NOT_COMPLETED', {});
        },
        updateAttachment: async (parent, args, context, info) => {
            const updated = await context.dataSources.mongoAPI.updateAttachment(args.attachment);
            if (updated) return updated;
            throw new ApolloError('Could not update attachment', 'ACTION_NOT_COMPLETED', {});
        },
        deleteAttachment: async (parent, args, context, info) => {
            const deleted = await context.dataSources.mongoAPI.deleteAttachment(args.id);
            return deleted;
            throw new ApolloError('Could not delete attachment', 'ACTION_NOT_COMPLETED', {});
        },
    },
};