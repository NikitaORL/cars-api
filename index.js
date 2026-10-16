const express = require('express')
const swaggerUi = require('swagger-ui-express')
const yamljs = require('yamljs')
const swaggerDocument = yamljs.load('./docs/swagger.yaml')

const app = express()
const port = 8080

app.use(express.json())

const cars = [
    {id: 1, name: "Toyota Supra MK4", price: 45000},
    {id: 2, name: "BMW E39", price: 12000},
    {id: 3, name: "Mercedes S-klass W220", price: 8000},
    {id: 4, name: "Audi RS6", price: 65000},
    {id: 5, name: "Nissan Skyline R34", price: 90000},
    {id: 6, name: "Honda Civic Type R", price: 35000},
    {id: 7, name: "Mazda RX-7", price: 40000},
    {id: 8, name: "Subaru Impreza WRX", price: 25000}
]

app.get('/cars', (req, res) => {
    res.send(cars)
})

app.get('/cars/:id', (req, res) => {
    if (typeof cars[req.params.id - 1] === 'undefined') {
        return res.status(404).send({error: "Car not found"})
    }
    res.send(cars[req.params.id - 1])
})

app.post('/cars', (req, res) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).send({ error: 'One or all params are missing' })
    }
    let car = {
        id: cars.length + 1,
        price: req.body.price,
        name: req.body.name
    }
    cars.push(car)
    res.status(201)
        .location(`${getBaseUrl(req)}/cars/${cars.length}`)
        .send(car)
})

app.put('/cars/:id', (req, res) => {
    if (typeof cars[req.params.id - 1] === 'undefined') {
        return res.status(404).send({error: "Car not found"})
    }
    if (!req.body.name || !req.body.price) {
        return res.status(400).send({ error: 'One or all params are missing' })
    }
    cars[req.params.id - 1] = {
        id: req.params.id,
        name: req.body.name,
        price: req.body.price
    }
    res.send(cars[req.params.id - 1])
})

app.delete('/cars/:id', (req, res) => {
    if (typeof cars[req.params.id - 1] === 'undefined') {
        return res.status(404).send({error: "Car not found"})
    }
    cars.splice(req.params.id - 1, 1)
    res.status(204).end()
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`)
})

function getBaseUrl(req) {
    return req.connection && req.connection.encrypted
        ? 'https' : 'http' + `://${req.headers.host}`
}