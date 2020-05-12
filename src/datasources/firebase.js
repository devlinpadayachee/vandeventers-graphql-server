const {
  AuthenticationError,
  UserInputError,
  ApolloError
} = require('apollo-server-express');
const { DataSource } = require('apollo-datasource');
const UUID = require("uuid-v4");

class firebaseAPI extends DataSource {
  constructor({ firebaseInstance }) {
    super();
    this.firebaseAdmin = firebaseInstance.firebaseAdmin;
    this.defaultBucket = firebaseInstance.defaultBucket;
  }
  
  initialize(config) {
    this.context = config.context;
  }

  //Files
  async uploadFile(ext, fileName, metaData, contentType, content) {
    try {
      var file = this.defaultBucket.file(`${fileName}.${ext}`);
      const base64Text = content.split(';base64,').pop();
      const fileBuffer = Buffer.from(base64Text, 'base64');
      metaData.firebaseStorageDownloadTokens = UUID();
      try {
        const upload = await file.save(fileBuffer, {
          gzip: true,
          metadata: {
              contentType,
              metadata: metaData
          },
        });
        await file.makePublic();
        const fileData = await file.getMetadata()
        const url = fileData[0].mediaLink
        return url;
      } catch (e) {
        throw new ApolloError(e.message, 'FILE_UPLOAD_FAILED', {});
      }

    } catch(e){
      console.log('Oops Something went wrong while uploading your file');
      throw new ApolloError(e.message, 'ACTION_NOT_COMPLETED', {});
    }
  }
}

module.exports = firebaseAPI;
