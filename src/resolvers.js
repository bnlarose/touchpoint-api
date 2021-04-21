const { AuthenticationError } = require('apollo-server-errors')
const { withFilter, PubSub } = require('apollo-server')
const pubsub = new PubSub()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
require('dotenv').config({ path: __dirname + '../.env' })

/**
 * Used to ensure that the user requesting this action is authorized
 * @param {ID} userId
 */
const checkAuth = (userId) => {
  if (!userId) {
    throw new AuthenticationError('Please login to perform this action')
  }
}

function newEscalationSubscribe( _, args, { pubsub } ){
  return pubsub.asyncIterator('NEW_ESCALATION')
}

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
    DISPATCH: 'dispatch',
    ESCALATIONS: 'escalations',
    HELPDESK: 'helpdesk',
    RETAIL: 'retail',
    SALES: 'sales'
  },

  Position: {
    CSR: 'csr',
    DEV: 'developer',
    DISPATCHER: 'dispatcher',
    ESCALATIONS: 'escalations',
    HELPDESK: 'helpdesk',
    MANAGER: 'manager',
    SUPER: 'supervisor'
  },

  PhoneType: {
    HOME: 'home',
    MOBILE: 'mobile',
    OFFICE: 'office'
  },

  LOB: {
    CARE: 'care',
    INTERNET: 'internet',
    LANDLINE: 'landline',
    MOBILE: 'mobile',
    VIDEO: 'video'
  },

  Status: {
    CLOSED: 'closed',
    ESCALATED: 'escalated',
    OPEN: 'open',
    RESOLVING: 'resolving'
  },

  ContactChannel: {
    CHAT: 'chat',
    EMAIL: 'email',
    PHONE: 'phone',
    SOCIAL: 'social',
    WALKIN: 'walkin'
  },

  RequestType: {
    CALLBACK: 'callback',
    RESOLUTION: 'resolution',
    MODIFICATION: 'modification',
    INVESTIGATION: 'investigation'
  },

  Query: {
    /** USER QUERIES */

    // Find a User with the specified userId
    getUserById: async ( _, { targetUserId }, { User, userId } ) => {
      checkAuth(userId)

      // Search the User collection for an instance with that ID
      const user = await User.findById( targetUserId ).populate('reports_to')

      // Throw an error if no matching User is found
      if ( !user ) {
        throw new Error('User not found.')
      }

      // Return the found user
      return user
    },

    /** CONTACT QUERIES */
    getContactById: async ( _, { contactId }, { Contact, userId } ) => {
      /**
       * Search the Contact collection for an instance with the specified id
       */

      // Check if the user making the request is authorized
      checkAuth(userId)

      // Search for the Contact
      const contact = await Contact.findById( contactId )

      // Throw an error if no matching contact was found
      if (!contact) throw new Error('Contact not found.')

      // Return the fetched Contact
      return contact
    },

    getContactByTerm: async ( _, { searchTerm }, { Contact, userId } ) => {
      /**
       * Search the Contact collection for instances that contain the search term in the first_name, last_name, or email_address fields
       */

      // Check if the user making the request is authorized
      checkAuth(userId)

      const searchResults = await Contact.find(
        // Perform the text search
        {
          $text: {
            $search: searchTerm
          }
        },
        // Assign a text score to order matches
        {
          score: {
            $meta: 'textScore'
          }
        }
        // Sort by that textScore, then last name, then first name
      ).sort({
        score: {
          $meta: 'textScore'
        },
        last_name: 'desc',
        first_name: 'desc'
      })
      // Limit query to max 5 results
      .limit(5)

      // Return the search results
      return searchResults
    },

    /** ACCOUNT QUERIES */
    getAccountById: async ( _, { accountId }, { Account, userId  } ) => {
      /*
       * Search the Account collection for an instance with that ID
       * and populate references
      */
      checkAuth(userId)

      const account = await Account.findById( accountId )
      .populate(
        { path: 'service_list', model: 'Package' }
      )
      .populate(
        { path: 'contacts', model: 'Contact' }
      )

      // Throw an error if no matching account is found
      if ( !account ) throw new Error('Account not found.')

      // Return the fetched Account
      return account
    },

    getAccountByNumber: async ( _, { accNum }, { Account, userId } ) => {
      checkAuth(userId)

      /**
       * Search the Account collection for an instance with that account number
       * and populate references
       */

      const account = await Account.findOne({ account_number: accNum  })
      .populate(
        { path: 'service_list', model: 'Package' }
      )
      .populate(
        { path: 'contacts', model: 'Contact' }
      )
      .populate(
        { path: 'cases.category', model: 'CaseCategory' }
      )
      .populate(
        { path: 'cases.opened_by', model: 'User' }
      )
      .populate(
        { path: 'cases.interactions.recorded_by', model: 'User' }
      )
      .populate(
        {
          path: 'cases.interactions.action_requests.requested_by',
          model: 'User'
        }
      )
      .populate(
        {
          path: 'cases.interactions.action_requests.claimed_by',
          model: 'User'
        }
      )

      // Throw an error if no Account is found
      if ( !account ) throw new Error('Account not found.')

      // Return the fetched Account
      return account
    },

    getAccountsByContact: async ( _, { contactId }, { Account, userId } ) => {
      /**
       * Get all the Accounts that have the provided contact as one of their contacts
       */

      // Check if the user making the request is authorized
      checkAuth(userId)

      // Search for the Contact and only populate the Contacts array
      const accounts = Account.find({ contacts: contactId })
      .populate(
        { path: 'contacts', model: 'Contact' }
      )

      // Return the found account list, even if empty
      return accounts
    },

    getAccountByCaseId: async ( _, { caseId }, { Account, userId } ) => {
      // Check if the user making the request is authorized
      checkAuth(userId)

      // Search for the account that has this specific Case
      const account = await Account.findOne({ "cases._id": caseId })
      .populate(
        { path: 'cases.category', model: 'CaseCategory' }
      )
      .populate(
        { path: 'cases.opened_by', model: 'User' }
      )
      .populate(
        { path: 'cases.interactions.recorded_by', model: 'User' }
      )
      .populate(
        {
          path: 'cases.interactions.action_requests.requested_by',
          model: 'User'
        }
      )
      .populate(
        {
          path: 'cases.interactions.action_requests.claimed_by',
          model: 'User'
        }
      )

      // Throw an error if no Account is found
      if ( !account ) throw new Error('Account not found.')

      // Return the fetched Account
      return account
    },

    getAccountByInteractionId: async ( _, { interactionId }, { Account, userId } ) => {
      // Check if the user making the request is authorized
      checkAuth(userId)

      // Search for the Account that contains this specific Interaction
      const account = await Account.findOne({ "cases.interactions._id": interactionId })
      .populate(
        { path: 'cases.category', model: 'CaseCategory' }
      )
      .populate(
        { path: 'cases.opened_by', model: 'User' }
      )
      .populate(
        { path: 'cases.interactions.recorded_by', model: 'User' }
      )
      .populate(
        {
          path: 'cases.interactions.action_requests.requested_by',
          model: 'User'
        }
      )
      .populate(
        {
          path: 'cases.interactions.action_requests.claimed_by',
          model: 'User'
        }
      )

      // Throw an error if no Account is found
      if ( !account ) throw new Error('Account not found.')

      // Return the fetched Account
      return account
    },

    getAccountByARId: async ( _, { ARId }, { Account, userId } ) => {
      // Check if the user making the request is authorized
      checkAuth(userId)

      // Search for the Account that contains this specific AR
      const account = await Account.findOne({ "cases.interactions.action_requests._id": ARId })
      .populate(
        { path: 'cases.category', model: 'CaseCategory' }
      )
      .populate(
        { path: 'cases.opened_by', model: 'User' }
      )
      .populate(
        { path: 'cases.interactions.recorded_by', model: 'User' }
      )
      .populate(
        {
          path: 'cases.interactions.action_requests.requested_by',
          model: 'User'
        }
      )
      .populate(
        {
          path: 'cases.interactions.action_requests.claimed_by',
          model: 'User'
        }
      )

      // Throw an error if no Account is found
      if ( !account ) throw new Error('Account not found.')

      // Return the fetched Account
      return account
    },

    /** CASE CATEGORY QUERIES */
    getCaseCategoriesByLob: async ( _, { lob }, { CaseCategory, userId  } ) => {
      // Check if the user making the request is authorized
      checkAuth(userId)

      // Find all CaseCategories of the specified lob
      const categories = await CaseCategory.find({ lob }).sort({ name: 'asc' })

      // Throw an error if no matches found
      if ( !categories ) throw new Error('No categories found.')

      // Return the fetched Categories
      return categories
    },

    getDeptARs: async ( _, { dept }, { Account, userId } ) => {
      // Check if the user making the request is authorized
      checkAuth(userId)

      const filter = {
        'cases.interactions.action_requests.assigned_to': dept
      }

      const deptARs = await Account.aggregate(
        [
          {
            '$match': filter
          }, {
            '$unwind': {
              'path': '$cases',
              'preserveNullAndEmptyArrays': false
            }
          }, {
            '$unwind': {
              'path': '$cases.interactions',
              'preserveNullAndEmptyArrays': false
            }
          }, {
            '$unwind': {
              'path': '$cases.interactions.action_requests',
              'preserveNullAndEmptyArrays': false
            }
          }, {
            '$match': filter
          }, {
            '$project': {
              _id: 0,
              'caseId': '$cases._id',
              'ar': '$cases.interactions.action_requests'
            }
          }
        ]
      )

      return deptARs
    },

    getUserClaimedARs: async ( _, { claimerId }, { Account, userId } ) => {
      // Check if the user making the request is authorized
      checkAuth(userId)

      /**
       * This filter is used in two pipeline stages and ensure that, in the
       * first instance, that only those Accounts that include esclations that
       * have been claimed by this user are selected, then selects those
       * specific escalations after the cases and interactions arrays have been
       * deconstructed
       */
      const filter = {
        'cases.interactions.action_requests.claimed_by': mongoose.Types.ObjectId(claimerId)
      }

      const userARs = await Account.aggregate(
        [
          {
            '$match': filter
          }, { // Creates a new dedicated document for every case in this array
            '$unwind': {
              'path': '$cases',
              'preserveNullAndEmptyArrays': false
            }
          }, { // Creates a new dedicated document for every interaction in this array
            '$unwind': {
              'path': '$cases.interactions',
              'preserveNullAndEmptyArrays': false
            }
          }, {
            '$unwind': {
              'path': '$cases.interactions.action_requests',
              'preserveNullAndEmptyArrays': false
            }
          }, {
            '$match': filter
          }, {
            '$project': {
              _id: 0,
              'caseId': '$cases._id',
              'ar': '$cases.interactions.action_requests'
            }
          }
        ]
      )

      return userARs
    },

    getManagerFacets: async ( _, { dept }, { Account, userId } ) => {
      // Check if the user making the request is authorized
      checkAuth(userId)

      /**
       * This filter is used to ensure that only interactions recorded by
       * members of the user's department are included
       */
      const filter = {
        'cases.interactions.recorded_by.department': dept
      }

      const managerFacets = await Account.aggregate(
        [
          { // Filter out Account documents that don't have any recorded cases
            '$match': {
              'cases': {
                '$ne': []
              }
            }
          }, { // Only keep the Account number and case array data elements
            '$project': {
              'account_number': 1,
              'cases': 1
            }
          }, {
            // Create a unique document for every Object in this array
            '$unwind': {
              'path': '$cases',
              'preserveNullAndEmptyArrays': false
            }
          }, {
            // Create a unique document for every Object in this array
            '$unwind': {
              'path': '$cases.interactions',
              'preserveNullAndEmptyArrays': false
            }
          }, {
            // Use the ID stored in recorded_by to find the user details
            '$lookup': {
              'from': 'users',
              'localField': 'cases.interactions.recorded_by',
              'foreignField': '_id',
              'as': 'cases.interactions.user'
            }
          }, { // Replace recorded_by with the fetched document
            '$addFields': {
              'cases.interactions.recorded_by': {
                '$first': '$cases.interactions.user'
              }
            }
          }, { // Only keep Interactions recorded by users in this department
            '$match': filter
          }, {
            '$unwind': {
              'path': '$cases.interactions.action_requests',
              'preserveNullAndEmptyArrays': true
            }
          }, { // Find the details of the user who made the Escalation
            '$lookup': {
              'from': 'users',
              'localField': 'cases.interactions.action_requests.requested_by',
              'foreignField': '_id',
              'as': 'cases.interactions.action_requests.request_user'
            }
          }, {
            '$lookup': { // Find the details of the user who made the Escalation
              'from': 'users',
              'localField': 'cases.interactions.action_requests.claimed_by',
              'foreignField': '_id',
              'as': 'cases.interactions.action_requests.claim_user'
            }
          }, {
            '$set': { // Replace the IDs with the fetched documents
              'cases.interactions.action_requests.requested_by': {
                '$first': '$cases.interactions.action_requests.request_user'
              },
              'cases.interactions.action_requests.claimed_by': {
                '$first': '$cases.interactions.action_requests.claim_user'
              }
            }
          }, {
            '$facet': {
              'interactionChannels': [
                { // Count the number of Interactions by channel
                  '$sortByCount': '$cases.interactions.channel'
                }
              ],
              'interactionDates': [
                { // Group interactions by Date and get a count
                  '$group': {
                    '_id': {
                      '$dateToString': {
                        'format': '%Y-%m-%d',
                        'date': '$cases.interactions.date'
                      }
                    },
                    'count': {
                      '$sum': 1
                    }
                  }
                }
              ],
              'arRequestTypes': [
                { // Count Escalations by Request Type
                  '$sortByCount': '$cases.interactions.action_requests.request_type'
                }
              ],
              'arStatuses': [
                { // Count Escalations by Status
                  '$sortByCount': '$cases.interactions.action_requests.status'
                }
              ]
            }
          }
        ]
      )

      return managerFacets
    },

    getSupervisorFacets: async ( _, { dept }, { Account, userId } ) => {
      // Check if the user making the request is authorized
      checkAuth(userId)

      // Matches those interactions recorded by members of the User's department
      const filter = {
        'cases.interactions.recorded_by.department': dept
      }

      const supervisorFacets = await Account.aggregate(
        [
          { // Ignore Accounts without cases
            '$match': {
              'cases': {
                '$ne': []
              }
            }
          }, { // Only keep the Account number and Case array of these documents
            '$project': {
              'account_number': 1,
              'cases': 1
            }
          }, {
            '$unwind': { // Create a new Document for each element in this array
              'path': '$cases',
              'preserveNullAndEmptyArrays': false
            }
          }, {
            '$unwind': { // Create a new Document for each element in this array
              'path': '$cases.interactions',
              'preserveNullAndEmptyArrays': false
            }
          }, {
            // Use the ID stored in recorded_by to fetch the user document
            '$lookup': {
              'from': 'users',
              'localField': 'cases.interactions.recorded_by',
              'foreignField': '_id',
              'as': 'cases.interactions.user'
            }
          }, {
            '$addFields': { // Swap the ID for the full User document
              'cases.interactions.recorded_by': {
                '$first': '$cases.interactions.user'
              }
            }
          }, { // Apply the Department filter
            '$match': filter
          }, {
            '$unwind': { // Create a new Document for each element in this array
              'path': '$cases.interactions.action_requests',
              'preserveNullAndEmptyArrays': true
            }
          }, {
            // Use the ID stored in requested_by to fetch the user document
            '$lookup': {
              'from': 'users',
              'localField': 'cases.interactions.action_requests.requested_by',
              'foreignField': '_id',
              'as': 'cases.interactions.action_requests.request_user'
            }
          }, {
            // Use the ID stored in claimed_by to fetch the user document
            '$lookup': {
              'from': 'users',
              'localField': 'cases.interactions.action_requests.claimed_by',
              'foreignField': '_id',
              'as': 'cases.interactions.action_requests.claim_user'
            }
          }, {
            '$set': { // Replace the IDs with the full User documents
              'cases.interactions.action_requests.requested_by': {
                '$first': '$cases.interactions.action_requests.request_user'
              },
              'cases.interactions.action_requests.claimed_by': {
                '$first': '$cases.interactions.action_requests.claim_user'
              }
            }
          }, {
            '$facet': {
              'interactionByAgents': [
                { // Count the number of interactions made by each agent
                  '$sortByCount': '$cases.interactions.recorded_by.username'
                }
              ],
              'interactionChannels': [
                { // Count the number of interactions made across each communcation channel
                  '$sortByCount': '$cases.interactions.channel'
                }
              ],
              'interactionDates': [
                { // Group interactions by date and count number
                  '$group': {
                    '_id': {
                      '$dateToString': {
                        'format': '%Y-%m-%d',
                        'date': '$cases.interactions.date'
                      }
                    },
                    'count': {
                      '$sum': 1
                    }
                  }
                }
              ],
              'arRequestTypes': [
                { // Count Escalations by request_type
                  '$sortByCount': '$cases.interactions.action_requests.request_type'
                }
              ],
              'arStatuses': [
                { // Count Escalations by status
                  '$sortByCount': '$cases.interactions.action_requests.status'
                }
              ]
            }
          }
        ]
      )

      return supervisorFacets
    }
  },

  Mutation: {
    /** USER MUTATIONS */

    createUser: async ( _, args, { User, userId  } ) => {
      checkAuth(userId)

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

    bulkCreateUser: async ( _, { docs }, { User, userId  } ) => {
      checkAuth(userId)

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
    },

    /** PACKAGE MUTATIONS */
    bulkCreatePackages: async ( _, { docs }, { Package, userId  }) => {
      checkAuth(userId)

      // Attempt to insert all the submitted Package documents and throw an error if something goes wrong
      const packages = await Package.create(docs)

      // Return the new Package documents to the client
      return packages
    },

    /** CONTACT MUTATIONS */
    bulkCreateContacts: async ( _, { docs }, { Contact, userId  } ) => {
      checkAuth(userId)

      // Attempt to insert all the submitted Contact documents and throw an error if something goes wrong
      const contacts = await Contact.create(docs)

      // Return the new Contact documents to the client
      return contacts
    },

    /** ACCOUNT MUTATIONS */
    bulkCreateAccounts: async ( _, { docs }, { Account, userId  } ) => {
      checkAuth(userId)

      // Attempt to insert all the submitted Account documents and throw an error if something goes wrong
      const accounts = await Account.create(docs)

      // Return the new Account documents to the client
      return accounts
    },

    /** CASE MUTATIONS */
    createCase: async ( _, { account_number, doc }, { Account, userId } ) => {
      checkAuth(userId)
      let updatedAccount

      const searchCase = await Account.findOne({
        account_number,
        "cases.title": doc.title
      })

      if (searchCase) {
        updatedAccount = searchCase
      } else {
        const account = await Account.findOneAndUpdate(
          // Find by Account Number
          { account_number },
          /**
           * Create a case with the supplied name if it doesn't already exist. * Nothing actually happens if it already exists
          */
          {
            $addToSet: {
              cases: doc
            }
          },
          // Capture the updated document
          { new: true }
        )

        updatedAccount = account
      }

      return updatedAccount
    },

    deleteCase: async ( _, { account_number, caseId }, { Account, userId } ) => {
      checkAuth(userId)

      const updatedAccount = await Account.findOneAndUpdate(
        // Find the relevant Account
        { account_number },
        // Remove the specified Case from the cases array
        {
          $pull: {
            cases: { _id: caseId }
          }
        },
        // Specify the return of the updated document
        { new: true }
      )
      .populate(
        { path: 'service_list', model: 'Package' }
      )
      .populate(
        { path: 'contacts', model: 'Contact' }
      )
      .populate(
        { path: 'cases.category', model: 'CaseCategory' }
      )
      .populate(
        { path: 'cases.opened_by', model: 'User' }
      )
      .populate(
        { path: 'cases.interactions.recorded_by', model: 'User' }
      )
      .populate(
        {
          path: 'cases.interactions.action_requests.requested_by',
          model: 'User'
        }
      )
      .populate(
        {
          path: 'cases.interactions.action_requests.claimed_by',
          model: 'User'
        }
      )

      // Return the updated Account
      return updatedAccount
    },

    /** INTERACTION MUTATIONS */
    createInteraction: async ( _, { caseId, doc }, { Account, userId }) => {
      checkAuth(userId)

      // Add the Interaction using these details
      const updatedAccount = await Account.findOneAndUpdate(
        // Find the case again
        { "cases._id": caseId },
        // Insert the Interaction details into the right Case
        {
          $addToSet: {
            "cases.$[i].interactions": doc
          }
        },
        // Capture the updated document
        {
          arrayFilters: [
            {
              "i._id": caseId
            }
          ],
          new: true
        }
      )

      return updatedAccount
    },

    /** ACTIONREQUEST MUTATIONS */
    createActionRequest: async ( _, { interactionId, doc }, { Account, userId } ) => {
      checkAuth(userId)

      const updatedAccount = await Account.findOneAndUpdate(
        // Find the revelant Interaction
        { "cases.interactions._id": interactionId },
        // Add the AR to the right Interaction
        {
          $addToSet: {
            "cases.$[].interactions.$[i].action_requests": doc
          }

        },
        // Apply ArrayFilter and capture updated document
        {
          arrayFilters: [
            {
              "i._id": interactionId
            }
          ],
          new: true
        }
      )

      pubsub.publish('NEW_ESCALATION', { ar: doc })
      return updatedAccount
    },

    changeARStatus: async ( _, { arId, status }, { Account, userId } ) => {
      // Check auth status
      checkAuth(userId)

      // Locate the parent Account and update the AR status
      const account = await Account.findOneAndUpdate(
        // Find the Account by the AR id
        { "cases.interactions.action_requests._id": arId },
        // Update the AR status
        {
          $set: {
            "cases.$[].interactions.$[].action_requests.$[i].status": status
          }
        },
        // Apply ArrayFilter and specify updated document return
        {
          arrayFilters: [
            {
              "i._id": arId
            }
          ],
          new: true
        }
      )

      return account
    },

    claimAR: async ( _, { arId }, { Account, userId } ) => {
      // Check auth status
      checkAuth(userId)

      // Locate the parent Account and update the claimed_by field
      const account = await Account.findOneAndUpdate(
        // Find the Account by the AR id
        { "cases.interactions.action_requests._id": arId },
        // Update the AR claimed_by property
        {
          $set: {
            "cases.$[].interactions.$[].action_requests.$[i].claimed_by": userId
          }
        },
        // Apply ArrayFilter and specify updated document return
        {
          arrayFilters: [
            {
              "i._id": arId
            }
          ],
          new: true
        }
      )

      return account
    },

    /** CASE CATEGORY MUTATIONS  */
    bulkCreateCaseCategories: async ( _, { docs }, { CaseCategory, userId  } ) => {
      checkAuth(userId)

      // Attempt to insert all the submitted CaseCategory documents and throw an error if something goes wrong
      const caseCategories = await CaseCategory.create(docs)

      // Return the new CaseCategory documents to the client
      return caseCategories
    },
  },

  Subscription: {
    newAR: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('NEW_ESCALATION'),
        (payload, variables) => {
          console.log('Payload', payload)
          console.log('Variables', variables)
          return payload.assigned_to === variables.dept;
        }
      )
    }
  }
}
