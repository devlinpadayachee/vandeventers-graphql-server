const { AuthenticationError, UserInputError, ApolloError } = require("apollo-server-express");
const { generateCalculatorHTML, getPDFBuffer } = require("../utils");

module.exports = {
  Query: {
    calculator: async (parent, args, context, info) => {
      const calculator = await context.dataSources.mongoAPI.calculator(args.id);
      return calculator;
    },
    calculators: async (parent, args, context, info) => {
      console.log("Got a query for calculators");
      const calculators = await context.dataSources.mongoAPI.calculators(args.limit, args.skip, args.query);
      return calculators;
    },
  },
  Mutation: {
    createCalculator: async (parent, args, context, info) => {
      const calculator = await context.dataSources.mongoAPI.createCalculator(args.calculator);
      if (calculator) return calculator;
      throw new ApolloError("Could not create calculator", "ACTION_NOT_COMPLETED", {});
    },
    updateCalculator: async (parent, args, context, info) => {
      const updated = await context.dataSources.mongoAPI.updateCalculator(args.calculator);
      if (updated) return updated;
      throw new ApolloError("Could not update calculator", "ACTION_NOT_COMPLETED", {});
    },
    deleteCalculator: async (parent, args, context, info) => {
      const deleted = await context.dataSources.mongoAPI.deleteCalculator(args.id);
      return deleted;
    },
    sendCalculatorResults: async (parent, args, context, info) => {
      try {
        const { to, subject, results } = args;

        // Generate HTML for email and PDF
        const htmlString = generateCalculatorHTML(results);

        // Generate PDF buffer
        const pdfBuffer = await getPDFBuffer(htmlString);

        // Set up email options
        const mail = await context.mailerQueue.add({
          to: to,
          subject: subject,
          html: htmlString,
          attachments: [
            {
              filename: `${subject}.pdf`,
              content: pdfBuffer,
            },
          ],
        });

        return {
          success: true,
          message: "Email sent successfully",
        };
      } catch (error) {
        console.error("Error sending calculator results:", error);
        return {
          success: false,
          message: `Error sending calculator results: ${error.message}`,
        };
      }
    },
    generateCalculatorPDF: async (parent, args, context, info) => {
      try {
        const { results } = args;

        // Generate HTML for PDF
        const htmlString = generateCalculatorHTML(results);

        // Generate PDF buffer
        const pdfBuffer = await getPDFBuffer(htmlString);

        // Convert buffer to base64 string
        const pdfBase64 = pdfBuffer.toString("base64");

        return {
          success: true,
          pdfBase64: pdfBase64,
        };
      } catch (error) {
        console.error("Error generating PDF:", error);
        return {
          success: false,
          message: `Error generating PDF: ${error.message}`,
        };
      }
    },
  },
};
