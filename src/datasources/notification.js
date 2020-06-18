const {
  AuthenticationError,
  UserInputError,
  ApolloError
} = require('apollo-server-express');
const { DataSource } = require('apollo-datasource');
const { Expo } = require('expo-server-sdk');
const axios = require('axios');
const qs = require('qs');
class notificationAPI extends DataSource {
  constructor({}) {
    super();
  }
  
  initialize(config) {
    this.context = config.context;
  }

  //Token
    //message format 
    // {
    //   to: pushToken,
    //   sound: 'default',
    //   body: 'This is a test notification',
    //   data: { withSome: 'data' },
    // }
  async sendMessages(messages = []) {
    try {
      let expo = new Expo();
      let chunks = expo.chunkPushNotifications(messages);
      let tickets = [];
      (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
          try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            tickets.push(...ticketChunk);
            // NOTE: If a ticket contains an error code in ticket.details.error, you
            // must handle it appropriately. The error codes are listed in the Expo
            // documentation:
            // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
          } catch (error) {
            console.error(error);
          }
        }
      })();
      return tickets;
    } catch (e) {
      console.error(e);
    }
  }
  async sendSMS(recipient, message) {
    try {
      const response = await axios.post('http://144.91.64.120:9010/api/sms/simplified', { text: message, sender: 'Lenco', recipient: recipient});
      return response.data;
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = notificationAPI;
