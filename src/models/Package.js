const mongoose = require('mongoose')
const Double = require('mongoose-double')

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
    type: Double,
    required: true
  }
})

module.exports = mongoose.model('Package', PackageSchema)
