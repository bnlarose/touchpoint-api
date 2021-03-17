const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: __dirname + '../.env' })

module.exports = {
  Site: {
    ARIMA: 'arima',
    CC: 'contactc',
    DEV: 'developer',
    CHAG: 'chaguanas',
    POS: 'port-of-spain',
    SANDO: 'sando',
    TOBAGO: 'tobago',
    OFFICE: 'backoffice'
  },

  Department: {
    CARE: 'care',
    DEV: 'development',
    ESCALATIONS: 'escalations',
    HELPDESK: 'helpdesk',
    RETAIL: 'retail',
    SALES: 'sales'
  },

  Position: {
    CSR: 'csr',
    DEV: 'developer',
    ESCALATIONS: 'escalations',
    HELPDESK: 'helpdesk',
    MANAGER: 'manager',
    SUPER: 'supervisor'
  },

  Query: {
    hello: () => `This is how it begins!`,

    // Find a User with the specified userId
    getUserById: async ( _, { userId }, { User } ) => {
      // Search the User collection for an instance with that ID
      const user = await User.findById( userId )

      // Throw an error if no matching User is found
      if ( !user ) {
        throw new Error('User not found.')
      }

      // Return the found user
      return user
    }
  },

  Mutation: {
    // User Mutations
    createUser: async ( _, args, { User } ) => {
      // Check if a User already exists with the specified username
      const user = await User.findOne({ username: args.username })

      // Check if user is truthy and throw an error if it is
      if ( user ) {
        throw new Error('User already exists! Please specify a different username.')
      }

      let userData = {
        first_name: args.first_name,
        last_name: args.last_name,
        username: args.username,
        email: args.email,
        password: args.password
      }

      if ( args.site ) {
        userData.site = args.site
      }

      if ( args.department ) {
        userData.department = args.department
      }

      if ( args.position ) {
        userData.position = args.position
      }

      if ( args.reports_to ) {
        userData.reports_to = args.reports_to
      }

      const newUser = await new User( userData ).save()

      return newUser
    },

    bulkCreateUser: async ( _, { docs }, { User } ) => {
      // Attempt to insert all the submitted User documents and throw an error if something goes wrong
      const users = await User.create(docs)

      // Return the new User documents to the client
      return users
    },

    loginUser: async ( _, { username, password }, { User } ) => {
      // Check if a user exists with the provided username
      const user = await User.findOne({ username })

      // Throw an error if no user is found
      if ( !user ) {
        throw new Error( 'User not found.' )
      }

      // Check if the supplied password is valid
      const isValidPassword = await bcrypt.compare(password, user.password)

      // Throw an error if the passwords do not match
      if ( !isValidPassword ) {
        throw new Error( 'Invalid password.' )
      }

      // Creates a JWT token using the supplied details
      const token = jwt.sign({ userId: user._id }, process.env.SECRET, { expiresIn: '10h' })

      // Returns the token and user, constituting the AuthPayload
      return { token, user }
    }
  }
}
