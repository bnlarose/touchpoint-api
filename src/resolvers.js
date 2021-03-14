module.exports = {
  Site: {
    ARIMA: 'arima',
    CC: 'concen',
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
    hello: () => `This is how it begins!`
  },

  Mutation: {
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

      const newUser = await new User( userData ).save()

      return newUser
    }
  }
}
