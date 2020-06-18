const {
  AuthenticationError,
  UserInputError,
  ApolloError
} = require('apollo-server-express');
const { DataSource } = require('apollo-datasource');
const isEmail = require('isemail');
const axios = require('axios');
const qs = require('qs');

class transunionAPI extends DataSource {
  constructor({ transunionInstance }) {
    super();
    this.client = transunionInstance.client;
  }
  
  initialize(config) {
    this.context = config.context;
  }

  //User Enquiry
  async userEnquiry(firstName, lastName, idNumber) {
    try {
      const token = "ASDF"
      const options = {
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'authorization': `Bearer ${token}` },
      }
      console.log(firstName, lastName, idNumber);
      const userEnquiry = await this.client.ProcessRequestTrans13Async( { 
        BureauEnquiry13 : {
          SubscriberCode: "90987",
          SecurityCode: "NUH87",
          IdentityNo1: idNumber,
          Forename1: firstName,
          Surname: lastName,
          EnquirerContactName: "Lenco",
          EnquirerContactPhoneNo: "0745770050",
        }
      })
      const enquiryResult = userEnquiry[0]?.ProcessRequestTrans13Result;
      const evolution = enquiryResult?.EvolutionCC01?.EvolutionCC01 ? enquiryResult?.EvolutionCC01?.EvolutionCC01[0] : null
      console.log('evolution', evolution);
      if (!evolution){
        return enquiryResult ? {
          raw: enquiryResult,
          summaryCount: {
            judgements: 0,
            defaults: 0,
            adverseAccounts: 0,
          },
          success: false,
        } : null
      }
      const judgementsCount = evolution.Curr_jdgmnt && evolution.prev_jdgmnt && evolution.other_jdgmnt ? parseInt(evolution.Curr_jdgmnt) + parseInt(evolution.prev_jdgmnt) + parseInt(evolution.other_jdgmnt) : 0
      const defaultsCount = evolution.Curr_default && evolution.prev_default ? parseInt(evolution.Curr_default) + parseInt(evolution.prev_default) : 0
      const adverseAccountsCount = evolution.adverse_accounts ? parseInt(evolution.adverse_accounts) : 0
      return enquiryResult ? {
        raw: enquiryResult,
        summaryCount: {
          judgements: judgementsCount,
          defaults: defaultsCount,
          adverseAccounts: adverseAccountsCount,
        },
        success: true,
      } : null
    } catch(e){
      console.log('Oops Something went wrong with finding the service location');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }
}

module.exports = transunionAPI;
