const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server');

const { rule, shield, and, or, not } = require('graphql-shield');

// Rules

const isAuthenticated = rule({ cache: 'contextual' })(
    async (parent, args, context, info) => {
        return context.user !== null ? true : new ApolloError("Not Authorized", 'NOT_AUTHORIZED')
    },
)

const isAdmin = rule({ cache: 'contextual' })(
    async (parent, args, context, info) => {
        return context.user.role === 'admin' ? true :  new ApolloError("Only admins can perform this function", 'NOT_AUTHORIZED')
    },
)

module.exports = shield({
    Query: {
        ping: not(isAuthenticated),
        me: isAuthenticated,
        user: isAuthenticated,
        post: isAuthenticated,
        posts: isAuthenticated,
    },
    Mutation: { 
        login: not(isAuthenticated),
        createUser: and(isAuthenticated, isAdmin),
        updateUser: and(isAuthenticated, isAdmin),
        deleteUser: and(isAuthenticated, isAdmin),
        createPost: and(isAuthenticated, isAdmin),
        updatePost: and(isAuthenticated, isAdmin),
        deletePost: and(isAuthenticated, isAdmin),
    },
},{
    allowExternalErrors : true
});