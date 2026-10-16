const express = require('express')
const app = express()
const port = 8080

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./docs/swagger.json');

app.get('/cars', (req, res) => {
    res.send(["Toyota Supra MK4", "BMW E39", "Mercedes S-klass W220"])
})


app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))


app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`)
})