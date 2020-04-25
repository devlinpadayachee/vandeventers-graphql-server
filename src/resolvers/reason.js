const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');

module.exports = {
    Query: {
        reason: async (parent, args, context, info) => {
            const reason = await context.dataSources.mongoAPI.reason(args.id);
            return reason;
        },
        reasons: async (parent, args, context, info) => {
            console.log('Querying Reasons');
            const reasons = await context.dataSources.mongoAPI.reasons(args.limit, args.skip, args.query);
            return reasons;
        }
    },
    Mutation: {
        createReason: async (parent, args, context, info) => {
            const reason = await context.dataSources.mongoAPI.createReason(args.reason);
            if (reason) return reason;
            throw new ApolloError('Could not create reason', 'ACTION_NOT_COMPLETED', {});
        },
        updateReason: async (parent, args, context, info) => {
            console.log(args);
            const updated = await context.dataSources.mongoAPI.updateReason(args.reason);
            if (updated) return updated;
            throw new ApolloError('Could not update reason', 'ACTION_NOT_COMPLETED', {});
        },
        deleteReason: async (parent, args, context, info) => {
            const deleted = await context.dataSources.mongoAPI.deleteReason(args.id);
            return deleted;
            throw new ApolloError('Could not delete reason', 'ACTION_NOT_COMPLETED', {});
        },
    },
};