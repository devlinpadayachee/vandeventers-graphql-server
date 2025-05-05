const { AuthenticationError, UserInputError, ApolloError } = require("apollo-server-express");
const { generateCalculatorHTML, getPDFBuffer, sendMail } = require("../utils");

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
        console.log(`Sending calculator results to ${to} with subject: ${subject}`);

        // Generate HTML for email and PDF
        const htmlString = generateCalculatorHTML(results);
        console.log("HTML generated successfully");

        // Generate PDF buffer
        const pdfBuffer = await getPDFBuffer(htmlString);
        console.log("PDF buffer generated successfully");

        // Prepare attachment
        const attachment = {
          filename: `${subject}.pdf`,
          content: pdfBuffer,
        };

        console.log("Attempting to send email directly (bypassing queue)");

        // Send email directly using the utility function instead of the queue
        const result = await sendMail(to, subject, htmlString, [attachment]);
        console.log("Email sent successfully:", result);

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
