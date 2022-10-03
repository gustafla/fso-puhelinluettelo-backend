const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
  .then(_result => {
    console.log('connected to MongoDB')
  }).catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, 'Name must be at least 3 characters'],
    required: [true, 'Name required'],
  },
  number: {
    type: String,
    validate: {
      validator: v => /^(\d{2}-\d{6,}|\d{3}-\d{5,})/.test(v),
      message: 'Phone number must be formatted like 00-1234567 or 111-22334455'
    },
    required: [true, 'Phone number required'],
  }
})

personSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
