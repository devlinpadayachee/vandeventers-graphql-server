const { gql } = require('apollo-server');

const typeDefs = gql`

    scalar JSON
    scalar JSONObject
        
`;

module.exports = typeDefs;