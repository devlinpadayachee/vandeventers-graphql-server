const {
  AuthenticationError,
  UserInputError,
  ApolloError
} = require('apollo-server-express');
const { DataSource } = require('apollo-datasource');
const isEmail = require('isemail');
const axios = require('axios');
const qs = require('qs');
var convert = require('xml-js');

class smappeeAPI extends DataSource {
  constructor({}) {
    super();
  }
  
  initialize(config) {
    this.context = config.context;
  }

  //Token
  async getAuthorizationDetails() {
    try {
      const response = await axios.get('https://eu.xpressdox.com/IntegrationServices/ThirdPartyService.svc/Login?username=joshua@nlateam.com&password=xpressdox');
      return response.data;
    } catch (e) {
      console.error(e);
    }
  }

  async token() {
    let getAuthorizationDetails = await this.getAuthorizationDetails();
    var getAuthorizationDetailsJSON = JSON.parse(convert.xml2json(getAuthorizationDetails, { ignoreComment: true, ignoreAttributes: true, compact: true, spaces: 2 }));
    console.log(getAuthorizationDetailsJSON);
    return getAuthorizationDetailsJSON['string']['_text'];
  }

  //Folders
  // async exploreRootFolder(serviceLocationId) {
  //   try {
  //     const token = await this.token();
  //     const options = {
  //       headers: { 'content-type': 'application/x-www-form-urlencoded', 'authorization': `Bearer ${token}` },
  //     }
  //     const serviceLocationResponse = await axios.get(`https://app1pub.smappee.net/dev/v2/servicelocation/${serviceLocationId}/info`, options);
  //     console.log(serviceLocationResponse.data)
  //     return serviceLocationResponse.data ? serviceLocationResponse.data : null;
  //   } catch(e){
  //     console.log('Oops Something went wrong with finding the service location');
  //     throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
  //   }
  // }

  // async serviceLocationElectricityConsumption(serviceLocationId, aggregation, from, to) {
  //   try {
  //     const token = await this.token();
  //     const options = {
  //       headers: { 'content-type': 'application/x-www-form-urlencoded', 'authorization': `Bearer ${token}` },
  //     }
  //     const serviceLocationElectricityConsumptionResponse = await axios.get(`https://app1pub.smappee.net/dev/v2/servicelocation/${serviceLocationId}/consumption?aggregation=${aggregation}&from=${from}&to=${to}`, options);
  //     console.log(serviceLocationElectricityConsumptionResponse.data)
  //     return serviceLocationElectricityConsumptionResponse.data ? serviceLocationElectricityConsumptionResponse.data : null;
  //   } catch(e){
  //     console.log('Oops Something went wrong with finding the electricity consumption for service location');
  //     throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
  //   }
  // }

  // async serviceLocationCostAnalysis(serviceLocationId, aggregation, from, to) {
  //   try {
  //     const token = await this.token();
  //     const options = {
  //       headers: { 'content-type': 'application/x-www-form-urlencoded', 'authorization': `Bearer ${token}` },
  //     }
  //     console.log(`https://app1pub.smappee.net/dev/v2/servicelocation/${serviceLocationId}/costanalysis?aggregation=${aggregation}&from=${from}&to=${to}`)
  //     const serviceLocationCostAnalysisResponse = await axios.get(`https://app1pub.smappee.net/dev/v2/servicelocation/${serviceLocationId}/costanalysis?aggregation=${aggregation}&from=${from}&to=${to}`, options);
  //     console.log(serviceLocationCostAnalysisResponse)
  //     return serviceLocationCostAnalysisResponse.data ? serviceLocationCostAnalysisResponse.data : null;
  //   } catch(e){
  //     console.log('Oops Something went wrong with finding the cost analysis for service location');
  //     throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
  //   }
  // }

  // async serviceLocations() {
  //   try {
  //     const token = await this.token();
  //     const options = {
  //       headers: { 'content-type': 'application/x-www-form-urlencoded', 'authorization': `Bearer ${token}` },
  //     }
  //     const serviceLocationsResponse = await axios.get('https://app1pub.smappee.net/dev/v1/servicelocation', options);
  //     const records = serviceLocationsResponse.data.serviceLocations;
  //     const count = records.length;
  //     return records.length > 0 ? { records, count } : { records : [], count: 0 };
  //   } catch(e){
  //     console.log('Oops Something went wrong');
  //     throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
  //   }
  // }

}

module.exports = smappeeAPI;
