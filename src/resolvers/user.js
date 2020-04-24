const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');
const bcrypt = require('bcrypt');
const isEmail = require('isemail');
const shortid = require('shortid');
const { paginateResults, getPasswordHash, getJWT } = require('../utils');

module.exports = {
    Query: {
        me: (parent, args, context, info) => {
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
        getResetPasswordLink: async (parent, args, context, info) => {
            const user = await context.dataSources.mongoAPI.findUserbyEmail(args.email);
            if (!user) throw new UserInputError('Could not find user!');
            const APP_DEFAULT_ADMIN_PASSWORD= process.env.APP_DEFAULT_ADMIN_PASSWORD || 'Sepiroth6043@';
            const resetToken = shortid.generate();
            var constructedURL = `${process.env.APP_CLIENT_URL}/#/password-reset/${resetToken}`;
            const updated = await context.dataSources.mongoAPI.updateUser({
                id: user.id,
                resetToken
            });
            const populatedTemplate = `<a href="${constructedURL}">Click here to reset your password</a>`
            var job = context.dataSources.mailAPI.sendMail(user.email, 'Password Reset', populatedTemplate);
            return job;
            throw new ApolloError('Could not generate password reset link mailer', 'ACTION_NOT_COMPLETED', {});
        },
        resetPassword: async (parent, args, context, info) => {
            const user = await context.dataSources.mongoAPI.findUserbyResetToken(args.resetToken);
            if (!user) throw new UserInputError('Could not find user!');
            const password = await getPasswordHash(args.password);
            const updated = await context.dataSources.mongoAPI.updateUser({
                id: user.id,
                password,
                resetToken: null
            });
            if (updated) return updated
            throw new ApolloError('Could not reset user password', 'ACTION_NOT_COMPLETED', {});
        },
        createUser: async (parent, args, context, info) => {
            if (!isEmail.validate(args.user.email)) {
                throw new UserInputError('Email is invalid', {
                    invalidArgs: ['email'],
                });
            }
            args.user.password = await getPasswordHash(args.user.password);
            const user = await context.dataSources.mongoAPI.createUser(args.user);
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