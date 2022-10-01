const express = require('express')

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  },
  {
    name: "Hello World",
    number: "12343456",
    id: 5
  }
]

const generateId = () => {
  return Math.floor(Math.random() * (2 ** 24))
}

const app = express()
app.use(express.json())

app.get('/info', (request, response) => {
  console.log(request.method, request.url)
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end(`Phonebook has info for ${persons.length} people\n\n${new Date()}\n`)
})

app.get('/api/persons', (request, response) => {
  console.log(request.method, request.url)
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  console.log(request.method, request.url)
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  console.log(request.method, request.url)
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  console.log(request.method, request.url)
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

  if (persons.some(p => p.name === body.name)) {
    return response.status(400).json({
      error: 'name already exists, use PUT /api/persons/id to update'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  console.log(person)
  response.json(person)
})

const PORT = 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))