const { AuthenticationError, UserInputError, ApolloError } = require("apollo-server-express");
const { DataSource } = require("apollo-datasource");

class mailAPI extends DataSource {
  constructor({ mailerQueueInstance }) {
    super();
    this.mailerQueue = mailerQueueInstance?.mailerQueue;
  }

  initialize(config) {
    this.context = config.context;
  }

  async sendMail(to, subject, html = "<h1>An error occured with the mail template</h1>", attachments = []) {
    console.log(`Mail API: Sending email to ${to} with subject: ${subject}`);

    if (!this.mailerQueue) {
      console.error("Mailer queue is not available");
      throw new Error("Email service is not configured properly");
    }

    try {
      console.log(`Adding job to mailer queue with ${attachments.length} attachments`);
      const job = await this.mailerQueue.add({
        to,
        subject,
        html,
        attachments,
      });

      console.log(`Mail job created with ID: ${job.id}`);
      return job;
    } catch (e) {
      console.error("Error in mailAPI.sendMail:", e);
      throw e;
    }
  }
}

module.exports = mailAPI;
