const mongoose = require('mongoose')

const ContactSchema = mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}/gm, 'Please provide a valid email address']
  },
  phone: [
    {
      category: {
        type: String,
        required: true
      },
      phone_number: {
        type: String,
        required: true,
        minLength: 7
      }
    }
  ]
})

// Create index to enable text search
ContactSchema.index({
  '$**': 'text'
})

module.exports = mongoose.model('Contact', ContactSchema)
