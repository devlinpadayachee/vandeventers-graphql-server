const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');

module.exports = {
    Query: {
        order: async (parent, args, context, info) => {
            const order = await context.dataSources.mongoAPI.order(args.id);
            return order;
        },
        orders: async (parent, args, context, info) => {
            console.log('Querying Orders');
            const orders = await context.dataSources.mongoAPI.orders(args.limit, args.skip, args.query);
            return orders;
        }
    },
    Mutation: {
        createOrder: async (parent, args, context, info) => {
            console.log(args);
            const order = await context.dataSources.mongoAPI.createOrder(args.order);
            if (order) return order;
            throw new ApolloError('Could not create order', 'ACTION_NOT_COMPLETED', {});
        },
        updateOrder: async (parent, args, context, info) => {
            console.log(args);
            const updated = await context.dataSources.mongoAPI.updateOrder(args.order);
            if (updated) return updated;
            throw new ApolloError('Could not update order', 'ACTION_NOT_COMPLETED', {});
        },
        deleteOrder: async (parent, args, context, info) => {
            const deleted = await context.dataSources.mongoAPI.deleteOrder(args.id);
            return deleted;
            throw new ApolloError('Could not delete order', 'ACTION_NOT_COMPLETED', {});
        },
    },
};