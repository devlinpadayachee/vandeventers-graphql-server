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
  }
  
  initialize(config) {
    this.context = config.context;
  }

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
      return updatedUser ? { id, updated: true, user: updatedUser } : { id, updated: false, user: args };
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
}

module.exports = mongoAPI;
