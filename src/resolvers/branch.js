const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');

module.exports = {
    Query: {
        branch: async (parent, args, context, info) => {
            const branch = await context.dataSources.mongoAPI.branch(args.id);
            return branch;
        },
        branches: async (parent, args, context, info) => {
            const branches = await context.dataSources.mongoAPI.branches(args.limit, args.skip, args.query);
            return branches;
        }
    },
    Mutation: {
        createBranch: async (parent, args, context, info) => {
            const branch = await context.dataSources.mongoAPI.createBranch(args.branch);
            if (branch) return branch;
            throw new ApolloError('Could not create branch', 'ACTION_NOT_COMPLETED', {});
        },
        updateBranch: async (parent, args, context, info) => {
            const updated = await context.dataSources.mongoAPI.updateBranch(args.branch);
            if (updated) return updated;
            throw new ApolloError('Could not update branch', 'ACTION_NOT_COMPLETED', {});
        },
        deleteBranch: async (parent, args, context, info) => {
            const deleted = await context.dataSources.mongoAPI.deleteBranch(args.id);
            return deleted;
            throw new ApolloError('Could not delete branch', 'ACTION_NOT_COMPLETED', {});
        },
    },
};