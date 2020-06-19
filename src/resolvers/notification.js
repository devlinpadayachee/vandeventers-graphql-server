const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');

module.exports = {
    Query: {
        notification: async (parent, args, context, info) => {
            const notification = await context.dataSources.mongoAPI.notification(args.id);
            return notification;
        },
        notifications: async (parent, args, context, info) => {
            console.log('Getting notifications', args);
            const notifications = await context.dataSources.mongoAPI.notifications(args.limit, args.skip, args.query);
            return notifications;
        }
    },
    Mutation: {
        createNotification: async (parent, args, context, info) => {
            var user = await context.dataSources.mongoAPI.user(args.notification.user);
            var pushToken = user.pushToken;
            const notification = await context.dataSources.mongoAPI.createNotification(args.notification);
            var ticket = await context.dataSources.notificationAPI.sendMessages([{
                to: pushToken, 
                sound: 'default',
                title: args.notification.title,
                body: 'A new ticket has been logged!',
                data: {
                    notification
                },
                priority: 'high'
            }]);
            if (notification) return notification;
            throw new ApolloError('Could not create notification', 'ACTION_NOT_COMPLETED', {});
        },
        updateNotification: async (parent, args, context, info) => {
            const updated = await context.dataSources.mongoAPI.updateNotification(args.notification);
            if (updated) return updated;
            throw new ApolloError('Could not update notification', 'ACTION_NOT_COMPLETED', {});
        },
        deleteNotification: async (parent, args, context, info) => {
            const deleted = await context.dataSources.mongoAPI.deleteNotification(args.id);
            return deleted;
            throw new ApolloError('Could not delete notification', 'ACTION_NOT_COMPLETED', {});
        },
    },
};