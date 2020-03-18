const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server');

const bcrypt = require('bcrypt');


const isEmail = require('isemail');
const { paginateResults, getPasswordHash, getJWT } = require('../utils');

module.exports = {
    Query: {
        me: (parent, args, context, info) => {
            console.log('parent',parent);
            console.log('context',context);
            return context.user
        },
        user: async (parent, args, context, info) => {
            const user = await context.dataSources.mongoAPI.user(args.id);
            return user;
        },
        users: async (parent, args, context, info) => {
            const users = await context.dataSources.mongoAPI.users(args.limit, args.skip, args.query);
            return users;
        }
    },
    Mutation: {
        login: async (parent, args, context, info) => {
            const user = await context.dataSources.mongoAPI.findUserbyEmail(args.email);
            if (!user) throw new AuthenticationError('Could not find user!');
            const passwordMatch = await bcrypt.compare(args.password, user.password);
            if (!passwordMatch) throw new AuthenticationError('The password you supplied is invalid!');
            const token = await getJWT( user );
            return { user, token };
        },
        createUser: async (parent, args, context, info) => {
            if (!isEmail.validate(args.email)) {
                throw new UserInputError('Email is invalid', {
                    invalidArgs: ['email'],
                });
            }
            args.password = await getPasswordHash(args.password);
            const user = await context.dataSources.mongoAPI.createUser(args);
            if (user) return user;
            throw new ApolloError('Could not create user', 'ACTION_NOT_COMPLETED', {});
        },
        updateUser: async (parent, args, context, info) => {
            const updated = await context.dataSources.mongoAPI.updateUser(args.user);
            if (updated) return updated;
            throw new ApolloError('Could not update user', 'ACTION_NOT_COMPLETED', {});
        },
        deleteUser: async (parent, args, context, info) => {
            const deleted = await context.dataSources.mongoAPI.deleteUser(args.id);
            return deleted;
            throw new ApolloError('Could not delete user', 'ACTION_NOT_COMPLETED', {});
        },
    },
};