const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// Define User schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  first_name: {
    type: String,
    trim: true
  },
  last_name: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  site: {
    type: String
  },
  department: {
    type: String
  },
  position: {
    type: String
  },
  reports_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

// Hash User password
UserSchema.pre('save', function(next) {
  // Check if the User password has been changed and skip if it hasn't
  if (!this.isModified('password')) {
    return next()
  }

  // Attempts to generate a random salt for use in hashing the password. Throws an error if anything goes wrong
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err)

    // Uses the created salt in combination with the password to create a hash, which is then saved as the password. Errors out if anything goes wrong.
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err)

      this.password = hash
      next()
    })
  })
})

// Export completed Model
module.exports = mongoose.model('User', UserSchema)
