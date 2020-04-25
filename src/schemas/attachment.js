const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Attachment {
        id: ID!
        base64: String!
        type: AttachmentType!
        createdBy: ID!
        createdAt: Float!
        updatedAt: Float!
    }

    extend type Query {
        attachment(id:ID!): Attachment
        attachments(limit:Int!, skip:Int!, query: JSON!): AttachmentsResponse!
    }

    extend type Mutation {
        createAttachment(attachment: AttachmentCreateInput): Attachment!
        updateAttachment(attachment: AttachmentUpdateInput): AttachmentUpdatedResponse! 
        deleteAttachment(id: ID!): AttachmentDeletedResponse! 
    }
   
    input AttachmentCreateInput {
        base64: String!
        type: AttachmentType!
        createdBy: ID!
    }

    input AttachmentUpdateInput {
        id: ID!
        base64: String
        type: AttachmentType
    }

    type AttachmentsResponse {
        records: [Attachment]!
        count: Int!
    }

    type AttachmentUpdatedResponse {
        id: ID!
        updated: Boolean!
        attachment: Attachment
    }

    type AttachmentDeletedResponse {
        id: ID!
        deleted: Boolean!
        attachment: Attachment
    }
`;

module.exports = typeDefs;