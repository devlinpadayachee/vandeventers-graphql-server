const {
  AuthenticationError,
  UserInputError,
  ApolloError
} = require('apollo-server');
const { DataSource } = require('apollo-datasource');
const isEmail = require('isemail');

class mongoAPI extends DataSource {
  constructor({ mongoInstance }) {
    super();
    this.User = mongoInstance.User;
    this.Post = mongoInstance.Post;
    this.Notification = mongoInstance.Notification;
    this.Reason = mongoInstance.Reason;
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
      const records = await this.User.find(query).limit(limit).skip(skip);
      return records.length > 0 ? { records, count } : { records : [], count: 0 };
    } catch(e){
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async createUser(args) {
    try {
      const user = await this.User.create(args);
      return user ? user : null;
    } catch(e){
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async updateUser(args) {
    try {
      const id = args.id
      const updatedUser = await this.User.findOneAndUpdate({ _id: id }, args, { new: true } );
      return updatedUser ? { id, updated: true } : { id, updated: false };
    } catch(e){
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async deleteUser(id) {
    try {
      const deletedUser = await this.User.deleteOne({ _id: id });
      return deletedUser.deletedCount > 0 ? { id, deleted: true } : { id, deleted: false };
    } catch(e){
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async findUserbyEmail(email) {
    try {
      console.log('findUserbyEmail', email)
      const user = await this.User.findOne({email: email});
      return user ? user : null;
    } catch(e){
      console.log('Oops Something went wrong with finding the user by email');
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
      const records = await this.Post.find(query).limit(limit).skip(skip);
      return records.length > 0 ? { records, count } : { records : [], count: 0 };
    } catch(e){
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async createPost(args) {
    try {
      const post = await this.Post.create(args);
      return post ? post : null;
    } catch(e){
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async updatePost(args) {
    try {
      const id = args.id
      const updatedPost = await this.Post.findOneAndUpdate({ _id: id }, args, { new: true } );
      return updatedPost ? { id, updated: true } : { id, updated: false };
    } catch(e){
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async deletePost(id) {
    try {
      const deletedPost = await this.Post.deleteOne({ _id: id });
      return deletedPost.deletedCount > 0 ? { id, deleted: true } : { id, deleted: false };
    } catch(e){
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  //Notifications
  async notification(id) {
    try {
      const notification = await this.Notification.findOne({ _id: id });
      return notification ? notification : null;
    } catch(e){
      console.log('Oops Something went wrong with finding the notification');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async notifications(limit = 10, skip = 0, query = {}) {
    try {
      const count = await this.Notification.where(query).countDocuments();
      if (skip >= count) {
        skip = 0;
      }
      const records = await this.Notification.find(query).limit(limit).skip(skip);
      return records.length > 0 ? { records, count } : { records : [], count: 0 };
    } catch(e){
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async createNotification(args) {
    try {
      const notification = await this.Notification.create(args);
      return notification ? notification : null;
    } catch(e){
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async updateNotification(args) {
    try {
      const id = args.id
      const updatedNotification = await this.Notification.findOneAndUpdate({ _id: id }, args, { new: true } );
      return updatedNotification ? { id, updated: true } : { id, updated: false};
    } catch(e){
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async deleteNotification(id) {
    try {
      const deletedNotification = await this.Notification.deleteOne({ _id: id });
      return deletedNotification.deletedCount > 0 ? { id, deleted: true } : { id, deleted: false };
    } catch(e){
      console.log('Oops Something went wrong');
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
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async createReason(args) {
    try {
      const reason = await this.Reason.create(args);
      return reason ? reason : null;
    } catch(e){
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async updateReason(args) {
    try {
      const id = args.id
      const updatedReason = await this.Reason.findOneAndUpdate({ _id: id }, args, { new: true } );
      return updatedReason ? { id, updated: true } : { id, updated: false};
    } catch(e){
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }

  async deleteReason(id) {
    try {
      const deletedReason = await this.Reason.deleteOne({ _id: id });
      return deletedReason.deletedCount > 0 ? { id, deleted: true } : { id, deleted: false };
    } catch(e){
      console.log('Oops Something went wrong');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }
}

module.exports = mongoAPI;
