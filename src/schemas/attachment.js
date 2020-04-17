const { gql } = require('apollo-server');

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
        updateAttachment(attachment: AttachmentUpdateInput): UpdatedResponse! 
        deleteAttachment(id: ID!): DeletedResponse! 
    }

    type AttachmentsResponse {
        records: [Attachment]!
        count: Int!
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

    
`;

module.exports = typeDefs;