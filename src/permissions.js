const {
  AuthenticationError,
  UserInputError,
  ApolloError,
} = require("apollo-server-express");

const { rule, shield, and, or, not } = require("graphql-shield");

// Rules

const isOpen = rule({ cache: "contextual" })(
  async (parent, args, context, info) => {
    return true;
  }
);

const isAuthenticated = rule({ cache: "contextual" })(
  async (parent, args, context, info) => {
    return context.user !== null
      ? true
      : new ApolloError("Not Authorized", "NOT_AUTHORIZED");
  }
);

const isAdmin = rule({ cache: "contextual" })(
  async (parent, args, context, info) => {
    return context.user.role === "admin"
      ? true
      : new ApolloError(
          "Only admins can perform this function",
          "NOT_AUTHORIZED"
        );
  }
);

module.exports = shield(
  {
    Query: {
      ping: isOpen,
      mailTest: and(isAuthenticated, isAdmin),
      fileUploadTest: and(isAuthenticated, isAdmin),
      me: isAuthenticated,
      user: isAuthenticated,
      users: isAuthenticated,
    },
    Mutation: {
      login: isOpen,
      getResetPasswordLink: isOpen,
      resetPassword: isOpen,
      createUser: isOpen,
      updateUser: and(isAuthenticated),
      deleteUser: and(isAuthenticated, isAdmin),
    },
  },
  {
    allowExternalErrors: true,
  }
);
