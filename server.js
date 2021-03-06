// Import ApolloServer constructor
const { ApolloServer, PubSub } = require('apollo-server')
const pubsub = new PubSub()

// Import environment variables
require('dotenv').config()

// Import mongoose and mongoose models
const mongoose = require('mongoose')
const User = require('./src/models/User')
const Package = require('./src/models/Package')
const Contact = require('./src/models/Contact')
const Account = require('./src/models/Account')
const CaseCategory = require('./src/models/CaseCategory')

// Import helper functions
const { getUserId } = require('./src/utils')

mongoose
  .connect(
    process.env.MONGO_URI,
    {
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false
    }
  )
  .then(() => console.log('Connected 🚀 To MongoDB Successfully'))
  .catch(err => console.error(err))

// Import typeDefs and resolvers
const typeDefs = require('./src/typeDefs')
const resolvers = require('./src/resolvers')

const server = new ApolloServer({
  cors: {
    origin: true,
    credentials: true
  },
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return {
      ...req,
      pubsub,
      User,
      Package,
      Contact,
      Account,
      CaseCategory,
      userId: req && req.headers.authorization ? getUserId(req) : null
    }
  }
})

server
  .listen()
  .then(({ url }) => (
    console.log(`Server is running on ${url}`)
  ))
