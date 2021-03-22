const { gql } = require('apollo-server')

module.exports = gql`
  type Query {
    # USER QUERIES
    getUserById(userId: ID!): User

    # ACCOUNT QUERIES
    getAccountById(accountId: ID!): Account
    getAccountByNumber(accNum: Int!): Account

    # CASE CATEGORY QUERIES
    getCaseCategoriesByLob(lob: String!): [CaseCategory]
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

    """
    Used to bulk add dummy data
    """
    bulkCreateAccounts(docs: [AccountInput]!): [Account]

    """
    Used to bulk add dummy data
    """
    bulkCreateCaseCategories(docs: [CaseCategoryInput]!): [CaseCategory]
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
    _id: ID
    account_number: Int!
    address: ServiceAddress
    createdDate: String
    service_list: [Package]!
    contacts: [Contact]!
    cases: [Case]
  }

  """
  Contains the details of a Case; (essentially)
  a call driver
  """
  type Case {
    _id: ID
    title: String!
    lob: LOB!
    category: CaseCategory!
    opened: String!
    last_updated: String!
    opened_by: User!
    interactions: [Interaction]
    status: Status
  }

  """
  Encapsulates the details of a specific
  instance of interaction with a Customer
  """
  type Interaction {
    _id: ID
    date: String!
    channel: ContactChannel!
    interacted_with: String!
    recorded_by: User!
    details: String!
    action_requests: [ActionRequest]
  }

  """
  An ActionRequest is an escalation for
  the purpose of having some activity
  performed, for the Customer's benefit
  """
  type ActionRequest {
    _id: ID
    created: String!
    due: String!
    requested_by: User!
    assigned_to: Department!
    request_type: RequestType!
    details: String!
    status: Status!
  }

  """
  Used to disposition Cases
  """
  type CaseCategory{
    _id: ID
    name: String!
    lob: LOB!
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
    CARE
    INTERNET
    LANDLINE
    MOBILE
    VIDEO
  }

  """
  Possible Case and ActionRequest statuses
  """
  enum Status {
    OPEN
    CLOSED
    ESCALATED
  }

  """
  Possible ommunications channel employed for interactions
  """
  enum ContactChannel {
    CHAT
    EMAIL
    PHONE
    SOCIAL
    WALKIN
  }

  """
  Possible activities facilitated by ActionRequests
  """
  enum RequestType {
    CALLBACK
    RESOLUTION
    MODIFICATION
    INVESTIGATION
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

  """
  Input mask used to hold Package instance details
  """
  input PackageInput {
    name: String!
    lob: String!
    price: Int!
  }

  """
  Input mask used to hold Contact instance details
  """
  input ContactInput {
    first_name: String!
    last_name: String!
    email: String!
    phone: [PhoneInput]!
  }

  """
  Input mask used to hold Phone instance details
  """
  input PhoneInput {
    category: String!
    phone_number: String!
  }

  """
  Input mask used to hold Account instance details
  """
  input AccountInput {
    account_number: Int!
    address: ServiceAddressInput!
    service_list: [String]!
    contacts: [String]!
  }

  """
  Input mask used to hold Service Address instance details
  """
  input ServiceAddressInput {
    street: String!
    city: String!
    island: String!
  }

  """
  Input mask used to hold Service Address instance details
  """
  input CaseCategoryInput {
    name: String!
    lob: String!
  }
`
