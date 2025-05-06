const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const pdf = require("html-pdf");
const Arena = require("bull-arena");
const isEmail = require("isemail");
const _ = require("lodash");
const { Schema } = mongoose;
var bullmq = require("bullmq");
var Queue = bullmq.Queue;
var Worker = bullmq.Worker;
var firebaseAdmin = require("firebase-admin");
var firebaseServiceAccount = require("../firebase-service-account.json");

module.exports.paginateResults = ({
  after: cursor,
  pageSize = 20,
  results,
  // can pass in a function to calculate an item's cursor
  getCursor = () => null,
}) => {
  if (pageSize < 1) return [];

  if (!cursor) return results.slice(0, pageSize);
  const cursorIndex = results.findIndex((item) => {
    // if an item has a `cursor` on it, use that, otherwise try to generate one
    let itemCursor = item.cursor ? item.cursor : getCursor(item);

    // if there's still not a cursor, return false by default
    return itemCursor ? cursor === itemCursor : false;
  });

  return cursorIndex >= 0
    ? cursorIndex === results.length - 1 // don't let us overflow
      ? []
      : results.slice(cursorIndex + 1, Math.min(results.length, cursorIndex + 1 + pageSize))
    : results.slice(0, pageSize);
};

module.exports.createMongoInstance = async () => {
  mongoose.set("useNewUrlParser", true);
  mongoose.set("useFindAndModify", false);
  mongoose.set("useCreateIndex", true);
  mongoose.set("useUnifiedTopology", true);
  mongoose.connect(process.env.APP_DB);
  var db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function () {
    console.log("Mongo DB connected");
  });

  const userSchema = new Schema(
    {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      idNumber: { type: String },
      password: { type: String, required: true },
      fullAddress: { type: String },
      telNumber: { type: String },
      rating: Number,
      priority: { type: Number, default: 0 },
      email: { type: String, required: true, index: true, unique: true },
      bio: { type: String },
      title: { type: String },
      industry: { type: String },
      role: { type: String, required: true, enum: ["admin", "user"] },
      branch: { type: String, default: "jhb" },
      pushToken: { type: String },
      location: { type: Object },
      metaData: { type: Object },
      profilePicture: { type: String },
      loginCounter: Number,
      resetToken: { type: String },
      showAsContact: { type: Boolean, default: false },
      jobTitle: { type: String },
      createdAt: Number,
      updatedAt: Number,
    },
    {
      timestamps: { currentTime: () => Date.now() },
    }
  );

  const documentSchema = new Schema(
    {
      name: { type: String, required: true },
      user: { type: Schema.Types.ObjectId, required: true },
      docClass: { type: String },
      category: { type: Schema.Types.ObjectId },
      documentLink: { type: String },
      documentFileName: { type: String },
      createdBy: { type: Schema.Types.ObjectId, required: true },
      createdAt: Number,
      updatedAt: Number,
    },
    {
      timestamps: { currentTime: () => Date.now() },
    }
  );

  const categorySchema = new Schema(
    {
      name: { type: String, required: true },
      docClass: { type: String, required: true },
      parent: { type: Schema.Types.ObjectId },
      createdBy: { type: Schema.Types.ObjectId, required: true },
      createdAt: Number,
      updatedAt: Number,
    },
    {
      timestamps: { currentTime: () => Date.now() },
    }
  );

  const inventoryItemSchema = new Schema(
    {
      serial: { type: String, required: true },
      type: { type: String, required: true },
      user: { type: Schema.Types.ObjectId, required: true },
      supplierName: { type: String },
      supplierContactNumber: { type: String },
      installerName: { type: String },
      installerContactNumber: { type: String },
      notes: { type: String },
      damage: { type: String },
      installationImage: { type: String },
      invoiceDate: Number,
      invoiceReference: { type: String },
      createdBy: { type: Schema.Types.ObjectId, required: true },
      createdAt: Number,
      updatedAt: Number,
    },
    {
      timestamps: { currentTime: () => Date.now() },
    }
  );

  const calculatorSchema = new Schema(
    {
      name: { type: String, required: true },
      settings: { type: Object, default: {} },
      createdBy: { type: Schema.Types.ObjectId, required: true },
      createdAt: Number,
      updatedAt: Number,
    },
    {
      timestamps: { currentTime: () => Date.now() },
    }
  );

  const tagSchema = new Schema(
    {
      name: { type: String, required: true },
      type: { type: String, required: true },
      createdBy: { type: Schema.Types.ObjectId, required: true },
      createdAt: Number,
      updatedAt: Number,
    },
    {
      timestamps: { currentTime: () => Date.now() },
    }
  );

  const User = mongoose.model("User", userSchema);
  const Document = mongoose.model("Document", documentSchema);
  const Category = mongoose.model("Category", categorySchema);
  const InventoryItem = mongoose.model("InventoryItem", inventoryItemSchema);
  const Calculator = mongoose.model("Calculator", calculatorSchema);
  const Tag = mongoose.model("Tag", tagSchema);

  const APP_DEFAULT_ADMIN_EMAIL = process.env.APP_DEFAULT_ADMIN_EMAIL || "devlinpadayachee@gmail.com";
  const APP_DEFAULT_ADMIN_PASSWORD = process.env.APP_DEFAULT_ADMIN_PASSWORD || "Sepiroth6043@";
  const defaultAdminUser = await User.findOne({
    email: APP_DEFAULT_ADMIN_EMAIL,
  });
  if (!defaultAdminUser && isEmail.validate(APP_DEFAULT_ADMIN_EMAIL)) {
    console.log("Default admin user does not exist, creating one now");
    const password = await this.getPasswordHash(APP_DEFAULT_ADMIN_PASSWORD);
    const adminUser = await User.create({
      password,
      firstName: "vandeventers",
      lastName: "admin",
      idNumber: "8512315344083",
      fullAddress: "1 Sjampanje Street, Wilgeheuwel",
      email: APP_DEFAULT_ADMIN_EMAIL,
      role: "admin",
    });
    if (adminUser) {
      console.log("Admin user created:", APP_DEFAULT_ADMIN_EMAIL);
    } else {
      console.log("An error occured when trying to create the default admin user");
    }
  } else {
    console.log("Skipped admin creation");
  }
  return {
    User,
    Document,
    Category,
    InventoryItem,
    Calculator,
    Tag,
  };
};

module.exports.createFirebaseInstance = async () => {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
    databaseURL: process.env.APP_FIREBASE_DB,
    storageBucket: process.env.APP_FIREBASE_STORAGE_BUCKET,
  });
  var defaultBucket = firebaseAdmin.storage().bucket();
  return { firebaseAdmin, defaultBucket };
};

module.exports.getPasswordHash = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, function (err, hash) {
      resolve(hash);
    });
  });
};

module.exports.getJWT = (user) => {
  return new Promise((resolve, reject) => {
    user = user.toJSON();
    user.id = user._id;
    delete user._id;
    const token = jwt.sign(user, "vandeventers_jwt_secret"); //Using toJson because user is a mongoose object
    resolve(token);
  });
};

module.exports.verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    try {
      if (token) {
        resolve(jwt.verify(token, "vandeventers_jwt_secret"));
      }
      resolve(null);
    } catch (err) {
      resolve(null);
    }
  });
};

module.exports.createMailerQueueInstance = async () => {
  try {
    console.log("Initializing mailer queue with Redis");

    // Get Redis configuration from environment
    const config = {
      port: parseInt(process.env.APP_MAILER_QUEUE_REDIS_PORT) || 6379,
      host: process.env.APP_MAILER_QUEUE_REDIS_URL || "127.0.0.1",
      username: process.env.APP_MAILER_QUEUE_REDIS_USERNAME || "",
      password: process.env.APP_MAILER_QUEUE_REDIS_PASSWORD || "",
      tls: true,
    };

    console.log("Redis connection config:", {
      port: config.port,
      host: config.host,
      username: config.username ? "****" : "(none)",
      password: config.password ? "****" : "(none)",
      tls: config.tls,
    });

    if (!config.host) {
      console.error("Redis host not configured. Mail service will not be available.");
      return { mailerQueue: null };
    }

    // Create the queue
    const mailerQueue = new Queue("mailer-queue", {
      connection: config,
    });

    // Create the worker to process queue items
    const worker = new Worker(
      "mailer-queue",
      async (job) => {
        console.log(`Mailer job ${job.id} started`);
        job.updateProgress(0);

        // Extract job data
        const {
          data: { to, subject, html, attachments = [] },
        } = job;

        console.log(`Preparing to send email to ${to} with subject: ${subject}`);
        job.updateProgress(20);

        try {
          job.updateProgress(50);
          console.log("Sending email...");
          const mailResult = await sendMail(to, subject, html, attachments);
          job.updateProgress(100);
          console.log(`Email sent successfully to ${to}`);
          return mailResult;
        } catch (error) {
          job.updateProgress(75);
          console.error(`Failed to send email to ${to}:`, error);
          throw new Error(`Error sending email: ${error.message}`);
        }
      },
      {
        connection: config,
        concurrency: 5, // Process up to 5 jobs at a time
      }
    );

    // Set up event handlers
    worker.on("error", (err) => {
      console.error("Worker error:", err);
    });

    worker.on("completed", (job, result) => {
      console.log(`Mailer job ${job.id} completed successfully`);
    });

    worker.on("failed", (job, error) => {
      console.error(`Mailer job ${job.id} failed:`, error);
    });

    console.log("Mailer queue initialized successfully");
    return { mailerQueue };
  } catch (error) {
    console.error("Failed to initialize mailer queue:", error);

    if (process.env.NODE_ENV === "production" && process.env.REDIS_URL) {
      console.error(`Redis connection failed using ${process.env.REDIS_URL}`);
    } else {
      console.error(
        `Redis connection failed on ${process.env.APP_MAILER_QUEUE_REDIS_URL || "127.0.0.1"}:${
          process.env.APP_MAILER_QUEUE_REDIS_PORT || 6379
        }`
      );
    }

    // Return empty mailerQueue to prevent null reference errors
    return { mailerQueue: null };
  }
};

function getPDFBuffer(html) {
  let options = {
    format: "A4",
    orientation: "portrait",
    type: "pdf",
    timeout: "100000",
    width: "930px",
    height: "1316px",
  };
  pdf.create(html, options).toBuffer((error, buffer) => {
    if (error) {
      return undefined;
    }
    return buffer;
  });
}

function sendMail(to, subject, html, attachments) {
  return new Promise((resolve, reject) => {
    console.log(`Direct email: Sending to ${to} with subject: ${subject}`);
    console.log({
      host: process.env.APP_MAILER_SMTP,
      port: parseInt(process.env.APP_MAILER_PORT),
      secure: process.env.APP_MAILER_SECURE && process.env.APP_MAILER_SECURE === "true" ? true : false,
      auth: {
        user: process.env.APP_MAILER_USERNAME,
        pass: "********",
      },
    });
    try {
      let transporter = nodemailer.createTransport({
        host: process.env.APP_MAILER_SMTP,
        port: parseInt(process.env.APP_MAILER_PORT),
        secure: process.env.APP_MAILER_SECURE && process.env.APP_MAILER_SECURE === "true" ? true : false,
        auth: {
          user: process.env.APP_MAILER_USERNAME,
          pass: process.env.APP_MAILER_PASSWORD,
        },
      });

      // Log attachment information but not content
      const attachmentInfo = attachments?.map((a) => ({
        filename: a.filename,
        contentLength: a.content ? Buffer.byteLength(a.content) : "N/A",
      }));
      console.log("Attachments:", attachmentInfo);

      let mailOptions = {
        from: process.env.APP_MAILER_FROM,
        to,
        subject,
        html,
        attachments,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Email sending error:", error);
          return reject(`An error occurred while trying to send mail to ${to}: ${error.message}`);
        }
        transporter.close();
        console.log("Email sent successfully, info:", info.messageId);
        return resolve(`Mail sent: ${info.messageId}`);
      });
    } catch (e) {
      console.error("Exception in sendMail:", e);
      return reject(`An error occurred while trying to send mail to ${to}: ${e.message}`);
    }
  });
}

// Export the sendMail function
module.exports.sendMail = sendMail;

module.exports.getArenaConfig = () => {
  const arenaConfig = Arena(
    {
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
      basePath: "/queues",
      disableListen: true,
    }
  );
  return arenaConfig;
};

module.exports.getUserToUserMailTemplate = (toUser, fromUser, message) => {
  return `<!doctype html>
  <html>
    <head>
        <meta charset="utf-8">
        <title>vandeventers Message</title>

        <style>
        .message-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, .15);
            font-size: 16px;
            line-height: 24px;
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #555;
        }

        .message-box table {
            width: 100%;
            line-height: inherit;
            text-align: left;
        }

        .message-box table td {
            padding: 5px;
            vertical-align: top;
        }

        .message-box table tr td:nth-child(2) {
            text-align: right;
        }

        .message-box table tr.top table td {
            padding-bottom: 20px;
        }

        .message-box table tr.top table td.title {
            font-size: 45px;
            line-height: 45px;
            color: #333;
        }

        .message-box table tr.information table td {
            padding-bottom: 40px;
        }

        .message-box table tr.heading td {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
            padding: 30px;
        }

        .message-box table tr.details td {
            padding-bottom: 20px;
        }

        .message-box table tr.item td{
            border-bottom: 1px solid #eee;
        }

        .message-box table tr.item.last td {
            border-bottom: none;
        }

        .message-box table tr.total td:nth-child(2) {
            border-top: 2px solid #eee;
            font-weight: bold;
        }

        @media only screen and (max-width: 600px) {
            .message-box table tr.top table td {
                width: 100%;
                display: block;
                text-align: center;
            }

            .message-box table tr.information table td {
                width: 100%;
                display: block;
                text-align: center;
            }
        }

        /** RTL **/
        .rtl {
            direction: rtl;
            font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
        }

        .rtl table {
            text-align: right;
        }

        .rtl table tr td:nth-child(2) {
            text-align: left;
        }
        </style>
    </head>
    <body>
        <div class="message-box">
            <table cellpadding="0" cellspacing="0">
                <tr class="top">
                    <td colspan="2">
                        <table>
                            <tr>
                                <td class="title">
                                    <img src="https://vandeventers-graphql-client.herokuapp.com/img/logo.ff72e2e1.png" style="width:100%; max-width:100px;">
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr class="information">
                    <td colspan="2">
                        <table>
                            <tr>
                                <td>
                                  ${fromUser.firstName} ${fromUser.lastName} sent you a message:<br>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr class="heading" colspan="2">
                    <td>
                      ${message}
                    </td>
                </tr>
                <tr class="information">
                    <td colspan="2">
                        <table>
                            <tr>
                                <td>
                                  You can get back to me at <a href="${process.env.APP_CLIENT_URL}">vandeventers</a><br>
                                  or contact me directly at ${fromUser.email}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </body>
  </html>`;
};
module.exports.getShopEnquiryTemplate = (fromUser, items) => {
  var itemHTML = "";
  _.forEach(items, function (item, index) {
    itemHTML += `<span>${index}: ${item}</span><br>`;
  });
  return `<!doctype html>
    <html>
      <head>
          <meta charset="utf-8">
          <title>vandeventers Shop Enquiry</title>

          <style>
          .message-box {
              max-width: 800px;
              margin: auto;
              padding: 30px;
              border: 1px solid #eee;
              box-shadow: 0 0 10px rgba(0, 0, 0, .15);
              font-size: 16px;
              line-height: 24px;
              font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
              color: #555;
          }

          .message-box table {
              width: 100%;
              line-height: inherit;
              text-align: left;
          }

          .message-box table td {
              padding: 5px;
              vertical-align: top;
          }

          .message-box table tr td:nth-child(2) {
              text-align: right;
          }

          .message-box table tr.top table td {
              padding-bottom: 20px;
          }

          .message-box table tr.top table td.title {
              font-size: 45px;
              line-height: 45px;
              color: #333;
          }

          .message-box table tr.information table td {
              padding-bottom: 40px;
          }

          .message-box table tr.heading td {
              background: #eee;
              border-bottom: 1px solid #ddd;
              font-weight: bold;
              padding: 30px;
          }

          .message-box table tr.details td {
              padding-bottom: 20px;
          }

          .message-box table tr.item td{
              border-bottom: 1px solid #eee;
          }

          .message-box table tr.item.last td {
              border-bottom: none;
          }

          .message-box table tr.total td:nth-child(2) {
              border-top: 2px solid #eee;
              font-weight: bold;
          }

          @media only screen and (max-width: 600px) {
              .message-box table tr.top table td {
                  width: 100%;
                  display: block;
                  text-align: center;
              }

              .message-box table tr.information table td {
                  width: 100%;
                  display: block;
                  text-align: center;
              }
          }

          /** RTL **/
          .rtl {
              direction: rtl;
              font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
          }

          .rtl table {
              text-align: right;
          }

          .rtl table tr td:nth-child(2) {
              text-align: left;
          }
          </style>
      </head>
      <body>
          <div class="message-box">
              <table cellpadding="0" cellspacing="0">
                  <tr class="information">
                      <td colspan="2">
                          <table>
                              <tr>
                                  <td>
                                    ${fromUser.firstName} ${fromUser.lastName} has enquired on the shop:<br>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
                  <tr class="heading" colspan="2">
                      <td>
                        ${itemHTML}
                      </td>
                  </tr>
              </table>
          </div>
      </body>
    </html>`;
};
module.exports.getUserOnboardingMailTemplate = (user) => {
  return `<!doctype html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>vandeventers Customer Email </title>
      <style>
      /* -------------------------------------
          INLINED WITH htmlemail.io/inline
      ------------------------------------- */
      /* -------------------------------------
          RESPONSIVE AND MOBILE FRIENDLY STYLES
      ------------------------------------- */
      @media only screen and (max-width: 620px) {
        table[class=body] h1 {
          font-size: 28px !important;
          margin-bottom: 10px !important;
        }
        table[class=body] p,
              table[class=body] ul,
              table[class=body] ol,
              table[class=body] td,
              table[class=body] span,
              table[class=body] a {
          font-size: 16px !important;
        }
        table[class=body] .wrapper,
              table[class=body] .article {
          padding: 10px !important;
        }
        table[class=body] .content {
          padding: 0 !important;
        }
        table[class=body] .container {
          padding: 0 !important;
          width: 100% !important;
        }
        table[class=body] .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important;
        }
        table[class=body] .btn table {
          width: 100% !important;
        }
        table[class=body] .btn a {
          width: 100% !important;
        }
        table[class=body] .img-responsive {
          height: auto !important;
          max-width: 100% !important;
          width: auto !important;
        }
      }

      /* -------------------------------------
          PRESERVE THESE STYLES IN THE HEAD
      ------------------------------------- */
      @media all {
        .ExternalClass {
          width: 100%;
        }
        .ExternalClass,
              .ExternalClass p,
              .ExternalClass span,
              .ExternalClass font,
              .ExternalClass td,
              .ExternalClass div {
          line-height: 100%;
        }
        .apple-link a {
          color: inherit !important;
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          text-decoration: none !important;
        }
        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
          font-size: inherit;
          font-family: inherit;
          font-weight: inherit;
          line-height: inherit;
        }
        .btn-primary table td:hover {
          background-color: #34495e !important;
        }
        .btn-primary a:hover {
          background-color: #34495e !important;
          border-color: #34495e !important;
        }
      }
      </style>
    </head>
    <body class="" style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
      <table border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;">
        <tr>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td>
          <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; Margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;">
            <div class="content" style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;">

              <!-- START CENTERED WHITE CONTAINER -->
              <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">vandeventers Potential Customer</span>
              <table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 3px;">

                <!-- START MAIN CONTENT AREA -->
                <tr>
                  <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">
                      <tr>
                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Hi vandeventers Team,</p>
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">You have a new customer ${user.email}</p>
                          <table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;">
                            <tbody>
                              <tr>
                                <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;">
                                  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">



                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Login to the vandeventers Admin Portal to view the customer</p>
                          <tbody>
                                  <tr>
                                      <td style="font-family: sans-serif; font-size: 14px;text-align: center; vertical-align: top; background-color: #000000; border-radius: 5px; text-align: center;"> <a href="https://vandeventers-graphql-client.onrender.com/#/" target="_blank" style="display: inline-block; color: #ffffff; background-color: #000000; border: solid 1px #000000; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #000000;">Take me to the vandeventers Admin Portal</a> </td>
                                  </tr>

                              </tbody>

                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              <!-- END MAIN CONTENT AREA -->
              </table>

              <!-- START FOOTER -->
              <div class="footer" style="clear: both; Margin-top: 10px; text-align: center; width: 100%;">
                <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">
                  <tr>
                    <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center;">
                      <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">vandeventers Africa (Pty) Ltd ,140a Kelvin Drive, Morningside Manor, 2196</span>

                    </td>
                  </tr>

                </table>
              </div>
              <!-- END FOOTER -->

            <!-- END CENTERED WHITE CONTAINER -->
            </div>
          </td>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td>
        </tr>
      </table>
    </body>
  </html>`;
};

// Add PDF buffer generation function
module.exports.getPDFBuffer = (htmlString) => {
  return new Promise((resolve, reject) => {
    const options = {
      format: "A4",
      orientation: "portrait",
      type: "pdf",
      timeout: 100000,
      width: "930px",
      height: "1316px",
    };

    process.env.OPENSSL_CONF = "/dev/null";
    pdf.create(htmlString, options).toBuffer((err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
};

// Format numbers with thousands separator
module.exports.thousands = (value) => {
  function floor(value, significance) {
    return Math.floor(value / significance) * significance;
  }

  // Check if value is a number or is a string that can be converted to number
  if (typeof value !== "number") {
    let test = Number(value);
    if (isNaN(test)) {
      return value;
    }
  }

  if (!value) return "0";
  let significanceValue = 10;
  let formattedValue = parseFloat(value.toString());

  if (formattedValue >= 0 && formattedValue < 100000) {
    significanceValue = 1;
  } else {
    significanceValue = 1000;
  }

  formattedValue = floor(Math.abs(formattedValue), significanceValue);
  return formattedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
};

// Generate HTML for calculator results
module.exports.generateCalculatorHTML = (results) => {
  const jsonResults = results;
  const containerStyles = "margin: 0 auto; padding: 20px; background-color: #fff;";
  const resultStyles = "margin-bottom: 20px;";
  const labelStyles = "font-weight: bold;";
  const tableStyles = "width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0;";
  const footerStyles = "margin-top: 20px; color: #888; font-size: 12px;";
  const thousands = this.thousands;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Helvetica, sans-serif;
                font-weight: 300;
                font-size: 12px;
                color: #333;
            }
            .container {
                ${containerStyles}
            }
            .result {
                ${resultStyles}
            }
            .label {
                ${labelStyles}
            }
            table, th, td {
                ${tableStyles}
                text-align: left;
            }
            td, th {
                padding: 5px;
                vertical-align: center;
            }
            .firstTd {
                width: 50%;
                text-align: left;
            }
            .footer {
                ${footerStyles}
            }
        </style>
    </head>
    <body>
      <div class="container">
        <img src="https://vandeventers-graphql-client.onrender.com/img/vv_logo.bbe6a182.png?alt=media&token=c677157c-e791-4df9-a4aa-b72c3bad94bd" alt="Header Image" style="width: auto; max-width: 400px; height: auto; display: block; margin: 0 auto;">
        <h2 style="margin-top: 20px; margin-bottom: 5px;">${jsonResults.heading}</h3>
        ${jsonResults.tables
          .map(
            (table) => `
              <h3 style="margin-top: 20px; margin-bottom: 5px;">${table.heading}</h4>
              <table>
                ${table.rows
                  .map(
                    (row) => `
                  <tr>
                    <td class="firstTd"><span style="font-weight: ${row.bold ? "bold" : "normal"};">${
                      row.label
                    }:</span></td>
                    <td style="font-weight: ${row.bold ? "bold" : "normal"};">${row.prefix || ""}${thousands(
                      row.value
                    )}${row.suffix || ""}</td>
                  </tr>
                `
                  )
                  .join("")}
              </table>
            `
          )
          .join("")}
        <p>${jsonResults.summaryText || ""}</p>
        <p class="footer">${jsonResults.footerText || ""}</p>
      </div>
    </body>
    </html>`;
};
