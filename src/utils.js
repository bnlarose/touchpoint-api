const jwt = require('jsonwebtoken')
require('dotenv').config({ path: __dirname + '../.env' })

// Decrypts the supplied token using the application secret
function getTokenPayload(token) {
  return jwt.verify(token, process.env.SECRET)
}

// This function is used to ensure that the requesting client is currently logged in, and to capture their userId
function getUserId(req, authToken) {
  // Check if a request has been supplied
  if ( req ) {
    // Capture the authorization header from the request
    const authHeader = req.headers.authorization

    // Check if auth header is not null
    if ( authHeader ) {
      // Strip the Bearer prefix from the header to expose the token
      const token = authHeader.replace('Bearer ', '')

      // Throw an error if there is no token
      if ( !token ) {
        throw new Error('No token found!')
      }

      // Capture the userId value from the token after decryption
      const { userId } = getTokenPayload(token)

      // Return the userId to the caller
      return userId
    }
  } else if ( authToken ) {
    // This alternative covers websocket connections, where the token is sent directly
    const { userId } = getTokenPayload(authToken)

    // Return the userId to the caller
    return userId
  }

  throw new Error('Please login to perform this action.')
}

module.exports = { getUserId }
