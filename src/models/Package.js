const mongoose = require('mongoose')

const PackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  lob: {
    type: String,
    required: true
  },
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  }
})

module.exports = mongoose.model('Package', PackageSchema)
