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
        me: isAuthenticated,
        user: isAuthenticated,
        users: isAuthenticated,
    },
    Mutation: { 
        login: not(isAuthenticated),
        createUser: and(isAuthenticated, isAdmin),
        updateUser: and(isAuthenticated, isAdmin),
        deleteUser: and(isAuthenticated, isAdmin),
    },
},{
    allowExternalErrors : true
});


// shield({
//     Query: {
//       frontPage: not(isAuthenticated),
//       fruits: and(isAuthenticated, or(isAdmin, isEditor)),
//       customers: and(isAuthenticated, isAdmin),
//     },
//     Mutation: {
//       addFruitToBasket: isAuthenticated,
//     },
//     Fruit: isAuthenticated,
//     Customer: isAdmin,
//   })