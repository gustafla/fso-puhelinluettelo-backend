require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

const app = express()
app.use(cors())
app.use(express.json())
morgan.token('body', (request) => request.method === 'POST' ? JSON.stringify(request.body) : null)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))

app.get('/info', (_request, response) => {
  Person.find({}).then(result => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end(`Phonebook has info for ${result.length} people\n\n${new Date()}\n`)
  }).catch(error => {
    console.log(error)
    response.status(500).end()
  })
})

app.get('/api/persons', (_request, response) => {
  Person.find({}).then(result => {
    response.json(result)
  }).catch(error => {
    console.log(error)
    response.status(500).end()
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => {
    console.log(error)
    response.status(400).json({ error: 'malformatted id' })
  })
})

app.put('/api/persons/:id', (request, response) => {
  const body = request.body

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing from request'
    })
  }

  Person.findByIdAndUpdate(request.params.id, { number: body.number }).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => {
    console.log(error)
    response.status(400).json({ error: 'malformatted id' })
  })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id).then(deleted => {
    console.log('deleted', deleted)
    response.status(204).end()
  }).catch(error => {
    console.log(error)
    response.status(400).json({ error: 'malformatted id' })
  })
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing from request'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing from request'
    })
  }

  Person.find({ name: body.name }).then(found => {
    if (found.length > 0) {
      console.log('found preexisting name:', found)
      response.status(400).json({
        error: 'name already exists, use PUT /api/persons/id to update'
      })
    } else {
      console.log('adding new name:', body.name)

      const person = new Person({
        name: body.name,
        number: body.number,
      })

      person.save().then(savedPerson => {
        response.json(savedPerson)
      }).catch(error => {
        console.log(error)
        response.status(500).end()
      })
    }
  }).catch(error => {
    console.log(error)
    response.status(500).end()
  })
})

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))