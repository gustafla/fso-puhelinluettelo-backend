require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

const app = express()

// JSON, CORS, logging, static middlewares
app.use(express.json())
app.use(cors())
morgan.token('body', (request) => request.method === 'POST' ? JSON.stringify(request.body) : null)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.static('build'))

app.get('/info', (_request, response, next) => {
  Person.find({}).then(result => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end(`Phonebook has info for ${result.length} people\n\n${new Date()}\n`)
  }).catch(error => next(error))
})

app.get('/api/persons', (_request, response, next) => {
  Person.find({}).then(result => {
    response.json(result)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      return response.json(person)
    }
    next()
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndUpdate(
    request.params.id,
    { number: request.body.number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(person => {
      if (person) {
        return response.json(person)
      }
      next()
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id).then(deleted => {
    console.log('deleted', deleted)
    response.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

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
      }).catch(error => next(error))
    }
  }).catch(error => next(error))
})

// 404 handler middleware
const unknownEndpoint = (_request, response) => {
  response.status(404).json({ error: 'not found' })
}

app.use(unknownEndpoint)

// Error handler middleware
const errorHandler = (error, _request, response, next) => {
  console.error('errorHandler:', error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))