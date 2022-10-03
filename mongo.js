const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fso-puhelinluettelo:${password}@cluster0.jgudg3z.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

// Just print all
if (process.argv.length === 3) {
  Person.find({}).then(result => {
    console.log('Phonebook:')
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
} else { // Add a new one
  if (process.argv.length < 5) {
    console.log('give new contact a number')
    process.exit(1)
  }

  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save().then(() => {
    console.log('contact saved!')
    mongoose.connection.close()
  })
}

console.log('bye')
