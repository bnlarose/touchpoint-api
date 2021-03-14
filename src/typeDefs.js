const { gql } = require('apollo-server')

module.exports = gql`
  type Query {
    hello: String!
  }

  type Mutation {
    createUser(
      first_name: String!
      last_name: String!
      username: String!
      email: String!
      password: String!
      site: String
      department: String
      position: String
    ): User
  }

  """
  The AuthPayload is returned upon
  successful user logins and contains
  both the authorizing token and details
  of the currently authorized user
  """
  type AuthPayload {
    token: String
    user: User
  }

  """
  Contains application user data
  """
  type User {
    _id: ID
    first_name: String!
    last_name: String!
    username: String!
    email: String!
    password: String!
    """
    Where this user is based
    """
    site: Site
    department: Department
    position: Position
    reports_to: User
  }

  """
  Organisational departments
  """
  enum Department {
    CARE
    DEV
    ESCALATIONS
    HELPDESK
    RETAIL
    SALES
  }

  """
  Job roles currently configured
  """
  enum Position {
    CSR
    DEV
    ESCALATIONS
    HELPDESK
    MANAGER
    SUPER
  }

  """
  Organisational physical locations
  """
  enum Site {
    ARIMA
    CC
    DEV
    CHAG
    POS
    SANDO
    TOBAGO
    OFFICE
  }
`
