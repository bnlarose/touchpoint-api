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
  },
  cases: [{
    title: {
      type: String,
      required: true
    },
    lob: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    opened: {
      type: Date,
      default: Date.now
    },
    opened_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      required: true
    },
    interactions: [{
      date: {
        type: Date,
        default: Date.now
      },
      channel: {
        type: String,
        required: true
      },
      interacted_with: {
        type: String,
        required: true
      },
      recorded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      details: {
        type: String,
        required: true
      },
      action_requests: [{
        created: {
          type: Date,
          default: Date.now
        },
        due: {
          type: Date,
          required: true
        },
        requested_by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        assigned_to: {
          type: String,
          required: true
        },
        request_type: {
          type: String,
          required: true
        },
        details: {
          type: String,
          required: true
        },
        status: {
          type: String,
          required: true
        }
      }]
    }]
  }]
})

module.exports = mongoose.model('Account', AccountSchema)
