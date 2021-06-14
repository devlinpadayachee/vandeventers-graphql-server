require("dotenv").config();
const {
  ApolloServer,
  makeExecutableSchema,
  AuthenticationError,
} = require("apollo-server-express");
const express = require("express");
const bodyParser = require("body-parser");
require("body-parser-xml")(bodyParser);
const { applyMiddleware } = require("graphql-middleware");
const BaseTypeDef = require("./schemas/base");
const UserTypeDef = require("./schemas/user");
const DocumentTypeDef = require("./schemas/document");
const CategoryTypeDef = require("./schemas/category");
const ProductTypeDef = require("./schemas/product");
const OrderTypeDef = require("./schemas/order");
const TagTypeDef = require("./schemas/tag");
const BaseResolver = require("./resolvers/base");
const UserResolver = require("./resolvers/user");
const DocumentResolver = require("./resolvers/document");
const CategoryResolver = require("./resolvers/category");
const ProductResolver = require("./resolvers/product");
const OrderResolver = require("./resolvers/order");
const TagResolver = require("./resolvers/tag");
const permissions = require("./permissions");

const {
  createMongoInstance,
  createFirebaseInstance,
  createMailerQueueInstance,
  getArenaConfig,
  verifyToken,
} = require("./utils");

const _ = require("lodash");
const mongoAPI = require("./datasources/mongo");
const firebaseAPI = require("./datasources/firebase");
const notificationAPI = require("./datasources/notification");
const mailAPI = require("./datasources/mail");

var mongoInstance;
var firebaseInstance;
var mailerQueueInstance;
(async () => {
  mongoInstance = await createMongoInstance();
  firebaseInstance = await createFirebaseInstance();
  mailerQueueInstance = await createMailerQueueInstance();
})();

const schema = applyMiddleware(
  makeExecutableSchema({
    typeDefs: [
      BaseTypeDef,
      UserTypeDef,
      DocumentTypeDef,
      CategoryTypeDef,
      ProductTypeDef,
      OrderTypeDef,
      TagTypeDef,
    ],
    resolvers: _.merge(
      BaseResolver,
      UserResolver,
      DocumentResolver,
      CategoryResolver,
      ProductResolver,
      OrderResolver,
      TagResolver
    ),
  }),
  permissions
);

const server = new ApolloServer({
  introspection: true,
  playground: true,
  schema,
  context: async ({ req }) => {
    let user = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.indexOf("Bearer ") !== -1
    ) {
      const tokenWithBearer = req.headers.authorization || "";
      const token = tokenWithBearer.split(" ")[1];
      let parsedToken = await verifyToken(token);
      user = parsedToken;
    }
    return { user };
  },
  dataSources: () => ({
    mongoAPI: new mongoAPI({ mongoInstance }),
    firebaseAPI: new firebaseAPI({ firebaseInstance }),
    notificationAPI: new notificationAPI({}),
    mailAPI: new mailAPI({ mailerQueueInstance }),
  }),
});

const app = express();
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.xml());
app.use("/", getArenaConfig());
app.use("/test", function (req, res, next) {
  console.log("Received Request Type:", req.method);
  console.log("Received Request Body:", req.body);
  res.send("ok");
});

server.applyMiddleware({ app });

app.listen({ port: process.env.PORT || 4000 }, () => {
  console.log(`Server started at ${process.env.APP_HOST_URL}`);
  console.log(`Server using db ${process.env.APP_DB}`);
});
