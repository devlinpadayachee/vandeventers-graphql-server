const {
  AuthenticationError,
  UserInputError,
  ApolloError,
} = require("apollo-server-express");
const { DataSource } = require("apollo-datasource");
const isEmail = require("isemail");

class mongoAPI extends DataSource {
  constructor({ mongoInstance }) {
    super();
    this.User = mongoInstance.User;
    this.Document = mongoInstance.Document;
    this.Category = mongoInstance.Category;
    this.Product = mongoInstance.Product;
    this.Order = mongoInstance.Order;
    this.Tag = mongoInstance.Tag;
  }

  initialize(config) {
    this.context = config.context;
  }

  //Users
  async user(id) {
    try {
      const user = await this.User.findOne({ _id: id });
      return user ? user : null;
    } catch (e) {
      console.log("Oops Something went wrong with finding the user");
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async users(limit = 10, skip = 0, query = {}) {
    try {
      const count = await this.User.where(query).countDocuments();
      if (skip >= count) {
        skip = 0;
      }
      const records = await this.User.find(query)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });
      return records.length > 0
        ? { records, count }
        : { records: [], count: 0 };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async createUser(args) {
    try {
      const user = await this.User.create(args);
      return user ? user : null;
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async updateUser(args) {
    try {
      const id = args.id;
      const updatedUser = await this.User.findOneAndUpdate({ _id: id }, args, {
        new: true,
      });
      return updatedUser
        ? { id, updated: true, user: updatedUser }
        : { id, updated: false, user: null };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async deleteUser(id) {
    try {
      const deletedUser = await this.User.deleteOne({ _id: id });
      return deletedUser.deletedCount > 0
        ? { id, deleted: true, user: deletedUser }
        : { id, deleted: false, user: null };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async findUserbyResetToken(resetToken) {
    try {
      console.log("findUserbyResetToken", resetToken);
      const user = await this.User.findOne({ resetToken: resetToken });
      return user ? user : null;
    } catch (e) {
      console.log(
        "Oops Something went wrong with finding the user by reset token"
      );
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async findUserbyEmail(email) {
    try {
      console.log("findUserbyEmail", email);
      const user = await this.User.findOne({ email: email }, "");
      return user ? user : null;
    } catch (e) {
      console.log("Oops Something went wrong with finding the user by email");
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  //Documents
  async document(id) {
    try {
      const document = await this.Document.findOne({ _id: id });
      return document ? document : null;
    } catch (e) {
      console.log("Oops Something went wrong with finding the document");
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async documents(limit = 10, skip = 0, query = {}) {
    try {
      const count = await this.Document.where(query).countDocuments();
      if (skip >= count) {
        skip = 0;
      }
      const records = await this.Document.find(query)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });
      return records.length > 0
        ? { records, count }
        : { records: [], count: 0 };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async createDocument(args) {
    try {
      const document = await this.Document.create(args);
      return document ? document : null;
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async updateDocument(args) {
    try {
      const id = args.id;
      const updatedDocument = await this.Document.findOneAndUpdate(
        { _id: id },
        args,
        { new: true }
      );
      return updatedDocument
        ? { id, updated: true, document: updatedDocument }
        : { id, updated: false, document: null };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async deleteDocument(id) {
    try {
      const deletedDocument = await this.Document.deleteOne({ _id: id });
      return deletedDocument.deletedCount > 0
        ? { id, deleted: true, document: deletedDocument }
        : { id, deleted: false, document: null };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  //Categories
  async category(id) {
    try {
      const category = await this.Category.findOne({ _id: id });
      return category ? category : null;
    } catch (e) {
      console.log("Oops Something went wrong with finding the category");
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async categories(limit = 10, skip = 0, query = {}) {
    try {
      const count = await this.Category.where(query).countDocuments();
      if (skip >= count) {
        skip = 0;
      }
      const records = await this.Category.find(query)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });
      return records.length > 0
        ? { records, count }
        : { records: [], count: 0 };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async createCategory(args) {
    try {
      const category = await this.Category.create(args);
      return category ? category : null;
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async updateCategory(args) {
    try {
      const id = args.id;
      const updatedCategory = await this.Category.findOneAndUpdate(
        { _id: id },
        args,
        { new: true }
      );
      return updatedCategory
        ? { id, updated: true, category: updatedCategory }
        : { id, updated: false, category: null };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async deleteCategory(id) {
    try {
      const deletedCategory = await this.Category.deleteOne({ _id: id });
      return deletedCategory.deletedCount > 0
        ? { id, deleted: true, category: deletedCategory }
        : { id, deleted: false, category: null };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  //Products
  async product(id) {
    try {
      const product = await this.Product.findOne({ _id: id });
      return product ? product : null;
    } catch (e) {
      console.log("Oops Something went wrong with finding the product");
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async products(limit = 10, skip = 0, query = {}) {
    try {
      const count = await this.Product.where(query).countDocuments();
      if (skip >= count) {
        skip = 0;
      }
      const records = await this.Product.find(query)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });
      return records.length > 0
        ? { records, count }
        : { records: [], count: 0 };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async createProduct(args) {
    try {
      const product = await this.Product.create(args);
      return product ? product : null;
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async updateProduct(args) {
    try {
      const id = args.id;
      const updatedProduct = await this.Product.findOneAndUpdate(
        { _id: id },
        args,
        { new: true }
      );
      return updatedProduct
        ? { id, updated: true, product: updatedProduct }
        : { id, updated: false, product: null };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async deleteProduct(id) {
    try {
      const deletedProduct = await this.Product.deleteOne({ _id: id });
      return deletedProduct.deletedCount > 0
        ? { id, deleted: true, product: deletedProduct }
        : { id, deleted: false, product: null };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  //Orders
  async order(id) {
    try {
      const order = await this.Order.findOne({ _id: id });
      return order ? order : null;
    } catch (e) {
      console.log("Oops Something went wrong with finding the order");
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async orders(limit = 10, skip = 0, query = {}) {
    try {
      const count = await this.Order.where(query).countDocuments();
      if (skip >= count) {
        skip = 0;
      }
      const records = await this.Order.find(query)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });
      return records.length > 0
        ? { records, count }
        : { records: [], count: 0 };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async createOrder(args) {
    try {
      const order = await this.Order.create(args);
      return order ? order : null;
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async updateOrder(args) {
    try {
      const id = args.id;
      const updatedOrder = await this.Order.findOneAndUpdate(
        { _id: id },
        args,
        { new: true }
      );
      return updatedOrder
        ? { id, updated: true, order: updatedOrder }
        : { id, updated: false, order: null };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async deleteOrder(id) {
    try {
      const deletedOrder = await this.Order.deleteOne({ _id: id });
      return deletedOrder.deletedCount > 0
        ? { id, deleted: true, order: deletedOrder }
        : { id, deleted: false, order: null };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  //Tags
  async tag(id) {
    try {
      const tag = await this.Tag.findOne({ _id: id });
      return tag ? tag : null;
    } catch (e) {
      console.log("Oops Something went wrong with finding the tag");
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async tags(limit = 10, skip = 0, query = {}) {
    try {
      const count = await this.Tag.where(query).countDocuments();
      if (skip >= count) {
        skip = 0;
      }
      const records = await this.Tag.find(query)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });
      return records.length > 0
        ? { records, count }
        : { records: [], count: 0 };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async createTag(args) {
    try {
      const tag = await this.Tag.create(args);
      return tag ? tag : null;
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async updateTag(args) {
    try {
      const id = args.id;
      const updatedTag = await this.Tag.findOneAndUpdate({ _id: id }, args, {
        new: true,
      });
      return updatedTag
        ? { id, updated: true, tag: updatedTag }
        : { id, updated: false, tag: null };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }

  async deleteTag(id) {
    try {
      const deletedTag = await this.Tag.deleteOne({ _id: id });
      return deletedTag.deletedCount > 0
        ? { id, deleted: true, tag: deletedTag }
        : { id, deleted: false, tag: null };
    } catch (e) {
      console.log("Oops Something went wrong", e);
      throw new ApolloError(e.message, "ACTION_NOT_COMPLETED", {});
    }
  }
}

module.exports = mongoAPI;
