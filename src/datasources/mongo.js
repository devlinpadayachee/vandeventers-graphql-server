const {
  AuthenticationError,
  UserInputError,
  ApolloError
} = require('apollo-server-express');
const { DataSource } = require('apollo-datasource');
const isEmail = require('isemail');

class mongoAPI extends DataSource {
  constructor({ mongoInstance }) {
    super();
    this.User = mongoInstance.User;
    this.Branch = mongoInstance.Branch;
    this.Post = mongoInstance.Post;
    this.Ticket = mongoInstance.Ticket;
    this.Reason = mongoInstance.Reason;
    this.Attachment = mongoInstance.Attachment;
    this.Product = mongoInstance.Product;
  }
  
  initialize(config) {
    this.context = config.context;
  }

  //Users
  async user(id) {
    try {
      const user = await this.User.findOne({ _id: id });
      return user ? user : null;
    } catch(e){
      console.log('Oops Something went wrong with finding the user');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async users(limit = 10, skip = 0, query = {}) {
    try {
      const count = await this.User.where(query).countDocuments();
      if (skip >= count) {
        skip = 0;
      }
      const records = await this.User.find(query).limit(limit).skip(skip).sort({ createdAt: -1 });
      return records.length > 0 ? { records, count } : { records : [], count: 0 };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async createUser(args) {
    try {
      const user = await this.User.create(args);
      return user ? user : null;
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async updateUser(args) {
    try {
      const id = args.id
      const updatedUser = await this.User.findOneAndUpdate({ _id: id }, args, { new: true } );
      return updatedUser ? { id, updated: true, user: updatedUser } : { id, updated: false, user: null };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async deleteUser(id) {
    try {
      const deletedUser = await this.User.deleteOne({ _id: id });
      return deletedUser.deletedCount > 0 ? { id, deleted: true, user: deletedUser  } : { id, deleted: false, user: null };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async findUserbyResetToken(resetToken) {
    try {
      console.log('findUserbyResetToken', resetToken)
      const user = await this.User.findOne({resetToken: resetToken});
      return user ? user : null;
    } catch(e){
      console.log('Oops Something went wrong with finding the user by reset token');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async findUserbyEmail(email) {
    try {
      console.log('findUserbyEmail', email)
      const user = await this.User.findOne({email: email},'');
      return user ? user : null;
    } catch(e){
      console.log('Oops Something went wrong with finding the user by email');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  //Branches
  async branch(id) {
    try {
      if (!id) return null
      const branch = await this.Branch.findOne({ _id: id });
      return branch ? branch : null;
    } catch(e){
      console.log('Oops Something went wrong with finding the branch');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async branches(limit = 10, skip = 0, query = {}) {
    try {
      const count = await this.Branch.where(query).countDocuments();
      if (skip >= count) {
        skip = 0;
      }
      const records = await this.Branch.find(query).limit(limit).skip(skip);
      return records.length > 0 ? { records, count } : { records : [], count: 0 };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async createBranch(args) {
    try {
      const branch = await this.Branch.create(args);
      return branch ? branch : null;
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async updateBranch(args) {
    try {
      const id = args.id
      const updatedBranch = await this.Branch.findOneAndUpdate({ _id: id }, args, { new: true } );
      return updatedBranch ? { id, updated: true, branch: updatedBranch } : { id, updated: false, branch: null };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async deleteBranch(id) {
    try {
      const deletedBranch = await this.Branch.deleteOne({ _id: id });
      return deletedBranch.deletedCount > 0 ? { id, deleted: true, branch: deletedBranch } : { id, deleted: false, branch: null };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  //Posts
  async post(id) {
    try {
      const post = await this.Post.findOne({ _id: id });
      return post ? post : null;
    } catch(e){
      console.log('Oops Something went wrong with finding the post');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async posts(limit = 10, skip = 0, query = {}) {
    try {
      const count = await this.Post.where(query).countDocuments();
      if (skip >= count) {
        skip = 0;
      }
      const records = await this.Post.find(query).limit(limit).skip(skip).sort({ createdAt: -1 });
      return records.length > 0 ? { records, count } : { records : [], count: 0 };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async createPost(args) {
    try {
      const post = await this.Post.create(args);
      return post ? post : null;
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async updatePost(args) {
    try {
      const id = args.id
      const updatedPost = await this.Post.findOneAndUpdate({ _id: id }, args, { new: true } );
      return updatedPost ? { id, updated: true, post: updatedPost } : { id, updated: false, post: null };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async deletePost(id) {
    try {
      const deletedPost = await this.Post.deleteOne({ _id: id });
      return deletedPost.deletedCount > 0 ? { id, deleted: true, post: deletedPost } : { id, deleted: false, post: null };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  //Tickets
  async ticket(id) {
    try {
      const ticket = await this.Ticket.findOne({ _id: id });
      return ticket ? ticket : null;
    } catch(e){
      console.log('Oops Something went wrong with finding the ticket');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async tickets(limit = 10, skip = 0, query = {}) {
    try {
      const count = await this.Ticket.where(query).countDocuments();
      if (skip >= count) {
        skip = 0;
      }
      const records = await this.Ticket.find(query).limit(limit).skip(skip).sort({ createdAt: -1 });
      return records.length > 0 ? { records, count } : { records : [], count: 0 };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async createTicket(args) {
    try {
      const ticket = await this.Ticket.create(args);
      return ticket ? ticket : null;
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async updateTicket(args) {
    try {
      const id = args.id
      const updatedTicket = await this.Ticket.findOneAndUpdate({ _id: id }, args, { new: true } );
      return updatedTicket ? { id, updated: true, ticket: updatedTicket } : { id, updated: false, ticket: null};
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async deleteTicket(id) {
    try {
      const deletedTicket = await this.Ticket.deleteOne({ _id: id });
      return deletedTicket.deletedCount > 0 ? { id, deleted: true, ticket: deletedTicket } : { id, deleted: false, ticket: null };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  //Reasons
  async reason(id) {
    try {
      const reason = await this.Reason.findOne({ _id: id });
      return reason ? reason : null;
    } catch(e){
      console.log('Oops Something went wrong with finding the reason');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async reasons(limit = 10, skip = 0, query = {}) {
    try {
      const count = await this.Reason.where(query).countDocuments();
      if (skip >= count) {
        skip = 0;
      }
      const records = await this.Reason.find(query).limit(limit).skip(skip);
      return records.length > 0 ? { records, count } : { records : [], count: 0 };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async createReason(args) {
    try {
      const reason = await this.Reason.create(args);
      return reason ? reason : null;
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async updateReason(args) {
    try {
      const id = args.id
      const updatedReason = await this.Reason.findOneAndUpdate({ _id: id }, args, { new: true } );
      return updatedReason ? { id, updated: true, reason: updatedReason } : { id, updated: false, reason: null };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async deleteReason(id) {
    try {
      const deletedReason = await this.Reason.deleteOne({ _id: id });
      return deletedReason.deletedCount > 0 ? { id, deleted: true, reason: deletedReason } : { id, deleted: false, reason: null };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  //Attachments

  async attachment(id) {
    try {
      const attachment = await this.Attachment.findOne({ _id: id });
      return attachment ? attachment : null;
    } catch(e){
      console.log('Oops Something went wrong with finding the attachment');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async attachments(limit = 10, skip = 0, query = {}) {
    try {
      const count = await this.Attachment.where(query).countDocuments();
      if (skip >= count) {
        skip = 0;
      }
      const records = await this.Attachment.find(query).limit(limit).skip(skip);
      return records.length > 0 ? { records, count } : { records : [], count: 0 };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async createAttachment(args) {
    try {
      const attachment = await this.Attachment.create(args);
      return attachment ? attachment : null;
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async updateAttachment(args) {
    try {
      const id = args.id
      const updatedAttachment = await this.Attachment.findOneAndUpdate({ _id: id }, args, { new: true } );
      return updatedAttachment ? { id, updated: true, attachment: updatedAttachment  } : { id, updated: false, attachment: null  };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async deleteAttachment(id) {
    try {
      const deletedAttachment = await this.Attachment.deleteOne({ _id: id });
      return deletedAttachment.deletedCount > 0 ? { id, deleted: true, attachment: deletedAttachment } : { id, deleted: false, attachment: null };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  //Products
  async product(id) {
    try {
      const product = await this.Product.findOne({ _id: id });
      return product ? product : null;
    } catch(e){
      console.log('Oops Something went wrong with finding the product');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async products(limit = 10, skip = 0, query = {}) {
    try {
      const count = await this.Product.where(query).countDocuments();
      if (skip >= count) {
        skip = 0;
      }
      const records = await this.Product.find(query).limit(limit).skip(skip).sort({ createdAt: -1 });
      return records.length > 0 ? { records, count } : { records : [], count: 0 };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async createProduct(args) {
    try {
      const product = await this.Product.create(args);
      return product ? product : null;
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async updateProduct(args) {
    try {
      const id = args.id
      const updatedProduct = await this.Product.findOneAndUpdate({ _id: id }, args, { new: true } );
      return updatedProduct ? { id, updated: true, product: updatedProduct } : { id, updated: false, product: null };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async deleteProduct(id) {
    try {
      const deletedProduct = await this.Product.deleteOne({ _id: id });
      return deletedProduct.deletedCount > 0 ? { id, deleted: true, product: deletedProduct } : { id, deleted: false, product: null };
    } catch(e){
      console.log('Oops Something went wrong', e);
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }
}

module.exports = mongoAPI;
