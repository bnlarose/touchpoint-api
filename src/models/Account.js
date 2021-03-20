const mongoose = require('mongoose')

const AccountSchema = new mongoose.Schema({
  account_number: {
    type: Number,
    unique: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    island: {
      type: String,
      required: true
    },
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  service_list: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Package',
    required: true,
  },
  contacts: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Contact',
    required: true
  }
})

module.exports = mongoose.model('Account', AccountSchema)
