const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');
module.exports = {
    Query: {
        xpressDoxReturn: async (parent, args, context, info) => {
            const xpressDoxReturn = await context.dataSources.mongoAPI.xpressDoxReturn(args.id);
            return xpressDoxReturn;
        },
        xpressDoxReturns: async (parent, args, context, info) => {
            console.log('Getting xpressDoxReturns', args);
            const xpressDoxReturns = await context.dataSources.mongoAPI.xpressDoxReturns(args.limit, args.skip, args.query);
            return xpressDoxReturns;
        }
    },
    Mutation: {
        createXpressDoxReturn: async (parent, args, context, info) => {
            const xpressDoxReturn = await context.dataSources.mongoAPI.createXpressDoxReturn(args.xpressDoxReturn);
            if (xpressDoxReturn) return xpressDoxReturn;
            throw new ApolloError('Could not create xpressDoxReturn', 'ACTION_NOT_COMPLETED', {});
        },
        updateXpressDoxReturn: async (parent, args, context, info) => {
            const updated = await context.dataSources.mongoAPI.updateXpressDoxReturn(args.xpressDoxReturn);
            if (updated) return updated;
            throw new ApolloError('Could not update xpressDoxReturn', 'ACTION_NOT_COMPLETED', {});
        },
        deleteXpressDoxReturn: async (parent, args, context, info) => {
            const deleted = await context.dataSources.mongoAPI.deleteXpressDoxReturn(args.id);
            return deleted;
            throw new ApolloError('Could not delete xpressDoxReturn', 'ACTION_NOT_COMPLETED', {});
        },
    },
};