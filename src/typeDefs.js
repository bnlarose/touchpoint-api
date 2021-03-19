const { gql } = require('apollo-server')

module.exports = gql`
  type Query {
    hello: String!
    getUserById(userId: ID!): User
  }

  type Mutation {
    """
    Creates a new User using the supplied details
    """
    createUser(
      first_name: String!
      last_name: String!
      username: String!
      email: String!
      password: String!
      site: String
      department: String
      position: String
      reports_to: String
    ): User

    """
    Used to bulk add dummy data
    """
    bulkCreateUser(docs: [UserInput!]!):[User]

    """
    Allows a user to authenticate against stored user credentials
    """
    loginUser(
      username: String!,
      password: String!
    ): AuthPayload

    """
    Used to bulk add dummy data
    """
    bulkCreatePackages(docs: [PackageInput]!): [Package]

    """
    Used to bulk add dummy data
    """
    bulkCreateContacts(docs: [ContactInput]!): [Contact]
  }

  """
  The AuthPayload is returned upon successful user logins and
  contains both the authorizing token and details of the currently
  authorized user
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
  Contains the details of the address at which a service instance is located
  """
  type ServiceAddress {
    street: String!
    city: String!
    island: String!
  }

  """
  Contains the type and number of a phone contact
  """
  type Phone {
    _id: ID
    category: PhoneType!
    phone_number: String!
  }

  """
  Contains the details of a service account contact
  """
  type Contact {
    _id: ID
    first_name: String!
    last_name: String!
    email: String!
    phone: [Phone]!
  }

  """
  Represents a service package within the API
  """
  type Package {
    _id: ID
    name: String!
    lob: LOB!
    price: Int!
  }

  """
  Contains the details of a service account
  """
  type Account {
    account_number: Int
    address: ServiceAddress
    service_list: [Package]!
    contacts: [Contact!]!
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


  """
  Types of phone contacts permitted
  """
  enum PhoneType {
    HOME
    MOBILE
    OFFICE
  }

  """
  Line of Business designations
  """
  enum LOB {
    INTERNET
    LANDLINE
    MOBILE
    VIDEO
  }

  """
  Encapsulates all non-hierarchical data
  elements required to create a user
  """
  input UserInput {
    first_name: String!
    last_name: String!
    username: String!
    email: String!
    password: String!
    site: String
    department: String
    position: String
    reports_to: String
  }

  input PackageInput {
    name: String!
    lob: String!
    price: Int!
  }

  input ContactInput {
    first_name: String!
    last_name: String!
    email: String!
    phone: [PhoneInput]!
  }

  input PhoneInput {
    category: String!
    phone_number: String!
  }
`
