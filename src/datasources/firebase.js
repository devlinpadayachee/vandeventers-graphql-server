const {
  AuthenticationError,
  UserInputError,
  ApolloError
} = require('apollo-server-express');
const { DataSource } = require('apollo-datasource');

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
      try {
        const upload = await file.save(content);
        const fileUrl = await file.getSignedUrl({action: 'read', expires: '03-09-2500'});
        await file.setMetadata({ contentType: contentType, metadata: metaData });
        return fileUrl[0];
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
