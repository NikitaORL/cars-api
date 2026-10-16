const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./docs/swagger.json')

const app = express()
const port = 8080

const cars = [
    {id: 1, name: "Toyota Supra MK4", price: 45000},
    {id: 2, name: "BMW E39", price: 12000},
    {id: 3, name: "Mercedes S-klass W220", price: 8000},
    {id: 4, name: "Audi RS6", price: 65000},
    {id: 5, name: "Nissan Skyline R34", price: 90000},
    {id: 6, name: "Honda Civic Type R", price: 35000},
    {id: 7, name: "Mazda RX-7", price: 40000},
    {id: 8, name: "Subaru Impreza WRX", price: 25000},
    {id: 9, name: "Mitsubishi Lancer Evo", price: 30000}
]

app.get('/cars', (req, res) => {
    res.send(cars)
})

app.get('/cars/:id', (req, res) => {
    res.send(cars[req.params.id])
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`)
})