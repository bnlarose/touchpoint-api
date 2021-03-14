// Import ApolloServer constructor
const { ApolloServer } = require('apollo-server')

// Import environment variables
require('dotenv').config()

// Import typeDefs and resolvers
const typeDefs = require('./src/typeDefs')
const resolvers = require('./src/resolvers')

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server
  .listen()
  .then(({ url }) => (
    console.log(`Server is running on ${url}`)
  ))