const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

module.exports.createMongoInstance = () => {
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useUnifiedTopology', true);
  mongoose.connect('mongodb+srv://admin:sepiroth6043@illyrian-graphql-server-uwzdp.gcp.mongodb.net/test?retryWrites=true&w=majority');
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log('Mongo DB connected')
  });

  const userSchema = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true, index: true, unique: true},
    role: {type: String, required: true, enum: ['admin', 'user']},
    createdAt: Number,
    updatedAt: Number,
  },{
    timestamps: { currentTime: () => Date.now() }
  });
  
  const User = mongoose.model('User', userSchema); 
 
  return { User };
};

module.exports.getPasswordHash = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, function(err, hash) {
      resolve(hash);
    });
  })
};

module.exports.getJWT = ( user ) => {
  return new Promise((resolve, reject) => {
    user = user.toJSON();
    user.id = user._id;
    delete user._id;
    const token = jwt.sign(user, 'illyrian_jwt_secret'); //Using toJson because user is a mongoose object
    resolve(token);
  })
};

module.exports.verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    try {
      if (token) {
        resolve(jwt.verify(token, 'illyrian_jwt_secret'));
      }
      resolve(null);
    } catch (err) {
      resolve(null);
    }
  })
};
