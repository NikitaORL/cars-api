const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express')
const mongoose = require('mongoose')
const swaggerUi = require('swagger-ui-express')
const yamljs = require('yamljs')

const app = express()
const port = 8080

app.use(express.json())

const uri = 'mongodb://nikitaorlenko234_db_user:Nikita0258@ac-hzqadxf-shard-00-00.viaybgw.mongodb.net:27017,' +
    'ac-hzqadxf-shard-00-01.viaybgw.mongodb.net:27017,ac-hzqadxf-shard-00-02.viaybgw.mongodb.net:27017' +
    '/cars-api?ssl=true&replicaSet=atlas-yq3u9e-shard-0&authSource=admin&retryWrites=true&w=majority'

mongoose.connect(uri)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.error('Error connecting:', error))

const carSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true }
}, { collection: 'cars' })

const Car = mongoose.model('Car', carSchema)

const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'viewer', password: 'viewer123', role: 'viewer' }
]

function basicAuth(req, res, next) {
    const authHeader = req.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.set('WWW-Authenticate', 'Basic realm="Cars API"')
        return res.status(401).send({ error: 'Authentication required' })
    }
    const base64 = authHeader.split(' ')[1]
    const [username, password] = Buffer.from(base64, 'base64').toString().split(':')

    const user = users.find(u => u.username === username && u.password === password)
    if (!user) {
        res.set('WWW-Authenticate', 'Basic realm="Cars API"')
        return res.status(401).send({ error: 'Invalid username or password' })
    }
    req.user = user
    next()
}

function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ error: 'Admin access required' })
    }
    next()
}

app.get('/cars', basicAuth, async (req, res) => {
    try {
        const cars = await Car.find()
        res.json(cars)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.get('/cars/:id', basicAuth, async (req, res) => {
    try {
        const car = await Car.findOne({ id: req.params.id })
        if (!car) return res.status(404).json({ message: 'Car not found' })
        res.json(car)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.post('/cars', basicAuth, requireAdmin, async (req, res) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).send({ error: 'One or all params are missing' })
    }
    try {
        const exists = await Car.findOne({ name: req.body.name })
        if (exists) {
            return res.status(409).send({ error: 'Car with this name already exists' })
        }

        const lastCar = await Car.findOne().sort({ id: -1 })
        const newId = lastCar ? lastCar.id + 1 : 1

        const car = new Car({
            id: newId,
            name: req.body.name,
            price: req.body.price
        })

        const newCar = await car.save()
        res.status(201).json(newCar)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

app.put('/cars/:id', basicAuth, requireAdmin, async (req, res) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).send({ error: 'One or all params are missing' })
    }
    try {
        const car = await Car.findOne({ id: req.params.id })
        if (!car) return res.status(404).json({ message: 'Car not found' })

        const duplicate = await Car.findOne({ name: req.body.name, id: { $ne: parseInt(req.params.id) } })
        if (duplicate) {
            return res.status(409).send({ error: 'Car with this name already exists' })
        }

        car.name = req.body.name
        car.price = req.body.price

        const updatedCar = await car.save()
        res.json(updatedCar)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

app.delete('/cars/:id', basicAuth, requireAdmin, async (req, res) => {
    try {
        const result = await Car.deleteOne({ id: parseInt(req.params.id) })

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Car not found' })
        }

        res.status(204).end()
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(yamljs.load('./docs/swagger.yaml')))

app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`)
})