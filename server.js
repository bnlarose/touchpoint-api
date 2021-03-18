// Import ApolloServer constructor
const { ApolloServer } = require('apollo-server')

// Import environment variables
require('dotenv').config()

// Import mongoose and mongoose models
const mongoose = require('mongoose')
const User = require('./src/models/User')
const Package = require('./src/models/Package')

// Import helper functions
const { getUserId } = require('./src/utils')

mongoose
  .connect(
    process.env.MONGO_URI,
    {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true
    }
  )
  .then(() => console.log('Connected 🚀 To MongoDB Successfully'))
  .catch(err => console.error(err))

// Import typeDefs and resolvers
const typeDefs = require('./src/typeDefs')
const resolvers = require('./src/resolvers')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return {
      ...req,
      User,
      Package,
      userId: req && req.headers.authorization ? getUserId(req) : null
    }
  }
})

server
  .listen()
  .then(({ url }) => (
    console.log(`Server is running on ${url}`)
  ))
