const mongoose = require('mongoose')

const CaseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  lob: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('CaseCategory', CaseCategorySchema)
