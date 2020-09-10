const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');

const shortid = require('shortid');
const mime = require('mime-types')

module.exports = {
    Query: {
        ticket: async (parent, args, context, info) => {
            const ticket = await context.dataSources.mongoAPI.ticket(args.id);
            return ticket;
        },
        tickets: async (parent, args, context, info) => {
            console.log('Getting tickets', args);
            const tickets = await context.dataSources.mongoAPI.tickets(args.limit, args.skip, args.query);
            return tickets;
        }
    },
    Mutation: {
        createTicket: async (parent, args, context, info) => {
            var user = await context.dataSources.mongoAPI.user(args.ticket.user);
            var pushToken = user.pushToken;
            if (args?.ticket?.images && args?.ticket?.images.length > 0){
                console.log('Attempting to get fileUrl from FireBase for ticket images');
                var firebaseImageItems = await Promise.all(args.ticket.images.map(async (image, index) => {
                    let mimeType = image.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
                    console.log(mimeType);
                    if (mimeType === 'image/jpg') {
                        mimeType = 'image/jpeg';
                    }
                    const fileUrl = await context.dataSources.firebaseAPI.uploadFile(mime.extension(mimeType), `ticket-pictures/${args.ticket.title}/${index}`, { working: true }, mimeType, image);
                    console.log(fileUrl)
                    return fileUrl;
                }));
                args.ticket.images = firebaseImageItems;
            }
            const ticket = await context.dataSources.mongoAPI.createTicket(args.ticket);
            var pushTicket = await context.dataSources.NotificationAPI.sendMessages([{
                to: pushToken, 
                sound: 'default',
                title: args.ticket.title,
                body: 'A new ticket has been logged!',
                data: {
                    ticket
                },
                priority: 'high'
            }]);
            if (ticket) return ticket;
            throw new ApolloError('Could not create ticket', 'ACTION_NOT_COMPLETED', {});
        },
        updateTicket: async (parent, args, context, info) => {
            const updated = await context.dataSources.mongoAPI.updateTicket(args.ticket);
            if (updated) return updated;
            throw new ApolloError('Could not update ticket', 'ACTION_NOT_COMPLETED', {});
        },
        deleteTicket: async (parent, args, context, info) => {
            const deleted = await context.dataSources.mongoAPI.deleteTicket(args.id);
            return deleted;
            throw new ApolloError('Could not delete ticket', 'ACTION_NOT_COMPLETED', {});
        },
    },
    Ticket: {
        userFullName: async (parent, args, context, info) => {
            const user = await context.dataSources.mongoAPI.user(parent.user);
            if (!user) return null;
            return `${user.firstName} ${user.lastName}`;
        },
        assigneeFullName: async (parent, args, context, info) => {
            const user = await context.dataSources.mongoAPI.user(parent.assignee);
            if (!user) return null;
            return `${user.firstName} ${user.lastName}`;
        }
    }
};