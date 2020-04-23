const {
  AuthenticationError,
  UserInputError,
  ApolloError
} = require('apollo-server-express');
const { DataSource } = require('apollo-datasource');

class mailAPI extends DataSource {
  constructor({ mailerQueueInstance }) {
    super();
    this.mailerQueue = mailerQueueInstance.mailerQueue;
  }
  
  initialize(config) {
    this.context = config.context;
  }

  async sendMail(to, subject, html = '<h1>An error occured with the mail template</h1>', filename = undefined) {
    try {
      const job = await this.mailerQueue.add({ to, subject, html, filename });
      return job;
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = mailAPI;
