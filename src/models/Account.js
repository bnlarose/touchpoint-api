const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

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
  service_list: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'Package'
  },
  contacts: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'Contact'
  }
})

AccountSchema.plugin(AutoIncrement, {inc_field: 'account_number', start_seq: 80000000})

module.exports = mongoose.model('Account', AccountSchema)
