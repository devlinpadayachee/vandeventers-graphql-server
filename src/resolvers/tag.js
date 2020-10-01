const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');

module.exports = {
    Query: {
        tag: async (parent, args, context, info) => {
            const tag = await context.dataSources.mongoAPI.tag(args.id);
            return tag;
        },
        tags: async (parent, args, context, info) => {
            console.log('Got a query for tags');
            const tags = await context.dataSources.mongoAPI.tags(args.limit, args.skip, args.query);
            return tags;
        }
    },
    Mutation: {
        createTag: async (parent, args, context, info) => {
            const tag = await context.dataSources.mongoAPI.createTag(args.tag);
            if (tag) return tag;
            throw new ApolloError('Could not create tag', 'ACTION_NOT_COMPLETED', {});
        },
        updateTag: async (parent, args, context, info) => {
            const updated = await context.dataSources.mongoAPI.updateTag(args.tag);
            if (updated) return updated;
            throw new ApolloError('Could not update tag', 'ACTION_NOT_COMPLETED', {});
        },
        deleteTag: async (parent, args, context, info) => {
            const deleted = await context.dataSources.mongoAPI.deleteTag(args.id);
            return deleted;
            throw new ApolloError('Could not delete tag', 'ACTION_NOT_COMPLETED', {});
        },
    },
};