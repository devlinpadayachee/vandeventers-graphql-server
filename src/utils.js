const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pdf = require('html-pdf');
var Queue = require('bull');
const Arena = require('bull-arena');
const isEmail = require('isemail');

module.exports.paginateResults = ({
  after: cursor,
  pageSize = 20,
  results,
  // can pass in a function to calculate an item's cursor
  getCursor = () => null,
}) => {
  if (pageSize < 1) return [];

  if (!cursor) return results.slice(0, pageSize);
  const cursorIndex = results.findIndex(item => {
    // if an item has a `cursor` on it, use that, otherwise try to generate one
    let itemCursor = item.cursor ? item.cursor : getCursor(item);

    // if there's still not a cursor, return false by default
    return itemCursor ? cursor === itemCursor : false;
  });

  return cursorIndex >= 0
    ? cursorIndex === results.length - 1 // don't let us overflow
      ? []
      : results.slice(
          cursorIndex + 1,
          Math.min(results.length, cursorIndex + 1 + pageSize),
        )
    : results.slice(0, pageSize);
};

module.exports.createMongoInstance = async () => {
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useUnifiedTopology', true);
  mongoose.connect(process.env.APP_DB);
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
    pushToken: {type: String},
    location: {type: Object},
    serviceLocations: {type: [String]},
    metaData: {type: Object},
    profilePicture: {type: String},
    homePicture: {type: String},
    loginCounter: Number,
    resetToken: {type: String},
    createdAt: Number,
    updatedAt: Number,
  },{
    timestamps: { currentTime: () => Date.now() }
  });
  
  const postSchema = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    createdBy: {type: Schema.Types.ObjectId, required: true},
    createdAt: Number,
    updatedAt: Number,
  },{
    timestamps: { currentTime: () => Date.now() }
  });

  const notificationSchema = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, required: true},
    reason: {type: Schema.Types.ObjectId},
    comment: {type: String},
    createdBy: {type: Schema.Types.ObjectId, required: true},
    createdAt: Number,
    updatedAt: Number,
  },{
    timestamps: { currentTime: () => Date.now() }
  });

  const reasonSchema = new Schema({
    explanation: {type: String, required: true},
    createdBy: {type: Schema.Types.ObjectId, required: true},
    createdAt: Number,
    updatedAt: Number,
  },{
    timestamps: { currentTime: () => Date.now() }
  });

  const attachmentSchema = new Schema({
    base64: {type: String, required: true},
    type: {type: String, required: true, enum: ['image']},
    createdBy: {type: Schema.Types.ObjectId, required: true},
    createdAt: Number,
    updatedAt: Number,
  },{
    timestamps: { currentTime: () => Date.now() }
  });
  
  const User = mongoose.model('User', userSchema);
  const Post = mongoose.model('Post', postSchema);
  const Notification = mongoose.model('Notification', notificationSchema);
  const Reason = mongoose.model('Reason', reasonSchema);
  const Attachment = mongoose.model('Attachment', attachmentSchema);
 
  const APP_DEFAULT_ADMIN_EMAIL = process.env.APP_DEFAULT_ADMIN_EMAIL || 'devlinpadayachee@gmail.com';
  const APP_DEFAULT_ADMIN_PASSWORD= process.env.APP_DEFAULT_ADMIN_PASSWORD || 'Sepiroth6043@';
  const defaultAdminUser = await User.findOne({email: APP_DEFAULT_ADMIN_EMAIL});
  if (!defaultAdminUser && isEmail.validate(APP_DEFAULT_ADMIN_EMAIL)) {
    console.log('Default admin user does not exist, creating one now');
    const password = await this.getPasswordHash(APP_DEFAULT_ADMIN_PASSWORD);
    const adminUser = await User.create({
      username: 'admin',
      password,
      email: APP_DEFAULT_ADMIN_EMAIL,
      role: 'admin'
    });
    if (adminUser) {
      console.log('Admin user created:', APP_DEFAULT_ADMIN_EMAIL)
    } else {
      console.log('An error occured when trying to create the default admin user');
    }
  } else {
    console.log('Skipped admin creation')
  }
  return { User, Post, Notification, Reason, Attachment };
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
    const token = jwt.sign(user, 'nuhome_jwt_secret'); //Using toJson because user is a mongoose object
    resolve(token);
  })
};

module.exports.verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    try {
      if (token) {
        resolve(jwt.verify(token, 'nuhome_jwt_secret'));
      }
      resolve(null);
    } catch (err) {
      resolve(null);
    }
  })
};

module.exports.createMailerQueueInstance = async () => {
  try {
    const mailerQueue = new Queue('mailer-queue', {redis: {port: parseInt(process.env.APP_MAILER_QUEUE_REDIS_PORT) || 6379, host: process.env.APP_MAILER_QUEUE_REDIS_URL || '127.0.0.1'}});
    mailerQueue.process(async (job) => {
      job.progress(0);
      const {data: { to, subject, html, filename = undefined }} = job;
      job.progress(20);
      let attachments = [];
      if (filename) {
        job.progress(30);
        const buffer = getPDFBuffer(html);
        attachments = buffer ? [{filename, content: buffer}] : [];
        job.progress(40);
      }
      try {
        job.progress(50);
        const mailResult = await sendMail(to, subject, html, attachments);
        job.progress(100);
        return mailResult
      } catch(error) {
        job.progress(75);
        throw new Error(error);
      }
    });
    mailerQueue.on('completed', (job, result) => {
      console.log(`Mailer job completed with result ${result}`);
    });
    return { mailerQueue };
  } catch(error) {
    console.log(`Failed to connect to Redis mailer queue on ${process.env.APP_MAILER_QUEUE_REDIS_URL || '127.0.0.1'}`)
  }
};

function getPDFBuffer (html) {
  let options = { 
    format: 'A4', 
    orientation: 'portrait', 
    type: 'pdf', 
    timeout: '100000', 
    width: "930px", 
    height: "1316px"
  }
  pdf.create(html, options).toBuffer((error, buffer) => {
    if (error) {
      return undefined;
    }
    return buffer;
  });
}

function sendMail (to, subject, html, attachments) {
  return new Promise((resolve, reject) => {
    console.log('Sending mail', { to, subject, html, attachments });
    console.log({
      host: process.env.APP_MAILER_SMTP,
      port: parseInt(process.env.APP_MAILER_PORT),
      secure: process.env.APP_MAILER_SECURE && process.env.APP_MAILER_SECURE === 'true' ? true : false,
      auth: {
        user: process.env.APP_MAILER_USERNAME,
        pass: process.env.APP_MAILER_PASSWORD
      }
    });
    let transporter = nodemailer.createTransport({
      host: process.env.APP_MAILER_SMTP,
      port: parseInt(process.env.APP_MAILER_PORT),
      secure: process.env.APP_MAILER_SECURE && process.env.APP_MAILER_SECURE === 'true' ? true : false,
      auth: {
        user: process.env.APP_MAILER_USERNAME,
        pass: process.env.APP_MAILER_PASSWORD
      }
    });
    let mailOptions = {
      from: process.env.APP_MAILER_FROM,
      to,
      subject,
      html,
      attachments
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if(error) {
        return reject(`An error occurred while tring to send mail to ${to}: ${error.message}`);
      }
      return resolve(`Mail sent: ${JSON.stringify(info)}`);
    });
  })
}

module.exports.getArenaConfig = () => {
  const arenaConfig = Arena({
    queues: [
      {
        name: "mailer-queue",
        hostId: "mailers",
        redis: {
          port: parseInt(process.env.APP_MAILER_QUEUE_REDIS_PORT) || 6379,
          host: process.env.APP_MAILER_QUEUE_REDIS_URL,
        },
      },
    ],
  },
  {
    basePath: '/queues',
    disableListen: true
  });
  return arenaConfig;
};






