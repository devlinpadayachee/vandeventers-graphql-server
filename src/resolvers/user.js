const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');
const bcrypt = require('bcrypt');
const isEmail = require('isemail');
const shortid = require('shortid');
const mime = require('mime-types')
const { paginateResults, getPasswordHash, getJWT, getUserToUserMailTemplate, getUserOnboardingMailTemplate } = require('../utils');

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
            const resetToken = shortid.generate();
            var constructedURL = `${process.env.APP_CLIENT_URL}/#/password-reset/${resetToken}`;
            const updated = await context.dataSources.mongoAPI.updateUser({
                id: user.id,
                resetToken
            });
            const populatedTemplate = `<a href="${constructedURL}">Click here to reset your password</a>`
            var job = context.dataSources.mailAPI.sendMail(user.email, 'Password Reset', populatedTemplate);
            if (job) return job;
            throw new ApolloError('Could not generate password reset link mailer', 'ACTION_NOT_COMPLETED', {});
        },
        resetPassword: async (parent, args, context, info) => {
            console.log('args', JSON.stringify(args));
            const user = await context.dataSources.mongoAPI.findUserbyResetToken(args.resetToken);
            if (!user) throw new UserInputError('Could not validate this reset link. Please make sure that you have clicked on the most recent password reset link that was sent to you.');
            const password = await getPasswordHash(args.password);
            const updated = await context.dataSources.mongoAPI.updateUser({
                id: user.id,
                password,
                resetToken: null
            });
            if (updated) return updated;
            throw new ApolloError('Could not reset user password', 'ACTION_NOT_COMPLETED', {});
        },
        sendUserToUserEmailMessage: async (parent, args, context, info) => {
            const toUser = await context.dataSources.mongoAPI.user(args.to);
            const fromUser = await context.dataSources.mongoAPI.user(args.from);
            if (!toUser || !fromUser) throw new UserInputError('Could not find one of the users specified!');
            const populatedTemplate  = await getUserToUserMailTemplate(toUser, fromUser, args.message);
            var job = context.dataSources.mailAPI.sendMail(toUser.email, `Lenco Message From ${fromUser.firstName} ${fromUser.lastName}`, populatedTemplate);
            if (job) return job;
            throw new ApolloError('Could not generate user to user message mailer', 'ACTION_NOT_COMPLETED', {});
        },
        sendOTP: async (parent, args, context, info) => {
            const sendOTPResponse = await context.dataSources.notificationAPI.sendSMS(args.recipient, args.message);
            if (!sendOTPResponse) throw new ApolloError('Could not send OTP', 'ACTION_NOT_COMPLETED', {});
            return sendOTPResponse;
        },
        createUser: async (parent, args, context, info) => {
            if (!isEmail.validate(args.user.email)) {
                throw new UserInputError('Email is invalid', {
                    invalidArgs: ['email'],
                });
            }
            if (args?.user?.documents){
                console.log('Attempting to get fileUrl for Documents from FireBase');
                let mimeType = args?.user?.documents.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
                console.log('Got MimeType', mimeType);
                const fileUrl = await context.dataSources.firebaseAPI.uploadFile('zip', `documents/${args.user.username}`, { working: true }, mimeType, args?.user?.documents);
                console.log(fileUrl)
                args.user.documents = fileUrl;
            }
            args.user.password = await getPasswordHash(args.user.password);
            const user = await context.dataSources.mongoAPI.createUser(args.user);
            if (user) {
                const populatedTemplate  = await getUserOnboardingMailTemplate(user);
                var job = context.dataSources.mailAPI.sendMail(process.env.APP_USER_CREATED_MAILER_TO_ADDRESS, `Lenco Has A New Customer`, populatedTemplate);
                return user;
            }
            throw new ApolloError('Could not create user', 'ACTION_NOT_COMPLETED', {});
        },
        updateUser: async (parent, args, context, info) => {
            if (args?.user?.profilePicture){
                console.log('Attempting to get fileUrl from FireBase');
                let mimeType = args?.user?.profilePicture.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
                const fileUrl = await context.dataSources.firebaseAPI.uploadFile(mime.extension(mimeType), `profile-pictures/${args.user.id}`, { working: true }, mimeType, args?.user?.profilePicture);
                console.log(fileUrl)
                args.user.profilePicture = fileUrl;
            }
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
    User: {
        branchName: async (parent, args, context, info) => {
            const branch = await context.dataSources.mongoAPI.branch(parent.branch);
            if (!branch) return null;
            return branch.name;
        }
    }
};