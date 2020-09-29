const {
    AuthenticationError,
    UserInputError,
    ApolloError
} = require('apollo-server-express');


const { GraphQLJSONObject } = require('graphql-type-json');
const GraphQLJSON = require('graphql-type-json');

module.exports = {
    Query: {
        ping: (parent, args, context, info) => {
            return "Im alive!";
        },
        mailTest: (parent, args, context, info) => {
            var job = context.dataSources.mailAPI.sendMail('devlinpadayachee@gmail.com', 'Test');
            return job;
        },
        fileUploadTest: (parent, args, context, info) => {
            var fileUrl = context.dataSources.firebaseAPI.uploadFile('txt', 'test/test', { working: true }, 'text/plain', 'Test');
            return fileUrl;
        },
        settings: (parent, args, context, info) => {
            var payfast = {};
            const APP_PAYFAST_MERCHANT_ID = process.env.APP_PAYFAST_MERCHANT_ID ? process.env.APP_PAYFAST_MERCHANT_ID : false;
            const APP_PAYFAST_MERCHANT_KEY = process.env.APP_PAYFAST_MERCHANT_KEY ? process.env.APP_PAYFAST_MERCHANT_KEY : false;
            const APP_PAYFAST_PASS_PHRASE = process.env.APP_PAYFAST_PASS_PHRASE ? process.env.APP_PAYFAST_PASS_PHRASE : false;
            const APP_PAYFAST_RETURN_URL = process.env.APP_PAYFAST_RETURN_URL ? process.env.APP_PAYFAST_RETURN_URL : false;
            const APP_PAYFAST_CANCEL_URL = process.env.APP_PAYFAST_CANCEL_URL ? process.env.APP_PAYFAST_CANCEL_URL : false;
            const APP_PAYFAST_NOTIFY_URL = process.env.APP_PAYFAST_NOTIFY_URL ? process.env.APP_PAYFAST_NOTIFY_URL : false;

            if (APP_PAYFAST_MERCHANT_ID && 
                APP_PAYFAST_MERCHANT_KEY && 
                APP_PAYFAST_PASS_PHRASE && 
                APP_PAYFAST_RETURN_URL && 
                APP_PAYFAST_CANCEL_URL && 
                APP_PAYFAST_NOTIFY_URL) {
                
                payfast.merchantID = APP_PAYFAST_MERCHANT_ID;
                payfast.merchantKey = APP_PAYFAST_MERCHANT_KEY;
                payfast.passPhrase = APP_PAYFAST_PASS_PHRASE;
                payfast.returnURL = APP_PAYFAST_RETURN_URL;
                payfast.cancelURL = APP_PAYFAST_CANCEL_URL;
                payfast.notifyURL = APP_PAYFAST_NOTIFY_URL;
            }
            else {
                throw new ApolloError(`Please check your payfast details:`, 'MISSING PAYFAST DETAILS', {});
            }

            var storeAddress = {};
            const APP_ADDRESSLINE1 = process.env.APP_ADDRESSLINE1 ? process.env.APP_ADDRESSLINE1 : false;
            const APP_ADDRESSLINE2 = process.env.APP_ADDRESSLINE2 ? process.env.APP_ADDRESSLINE2 : false;
            const APP_CITY = process.env.APP_CITY ? process.env.APP_CITY : false;
            const APP_COUNTRY = process.env.APP_COUNTRY ? process.env.APP_COUNTRY : false;
            const APP_POSTAL_CODE = process.env.APP_POSTAL_CODE ? process.env.APP_POSTAL_CODE : false;

            if (APP_ADDRESSLINE1 &&
                APP_ADDRESSLINE2 &&
                APP_CITY &&
                APP_COUNTRY &&
                APP_POSTAL_CODE) {

                storeAddress.addressLine1 = APP_ADDRESSLINE1;
                storeAddress.addressLine2 = APP_ADDRESSLINE2;
                storeAddress.city = APP_CITY;
                storeAddress.country = APP_COUNTRY;
                storeAddress.postalCode = APP_POSTAL_CODE;
            }
            else {
                throw new ApolloError(`Please check your payfast store address details:`, 'MISSING PAYFAST ADDRESS DETAILS', {});
            }

            if (payfast && storeAddress) {
                return {
                    payfast,
                    storeAddress
                }
            }
            throw new ApolloError(`Please check that the settings are correctly setup:`, 'SETTINGS SETUP FAILED', {});
        },
    },
    Mutation: {
        changeConfig: (parent, args, context, info) => {
            return 'OK';
        },
    },
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject,
};