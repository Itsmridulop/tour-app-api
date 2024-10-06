const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path: '.config.env'})
const app = require('./app')

const port = process.env.PORT || 8000

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB')
}).catch(error => {
    console.log(error)
    console.log('Failed to connect to database.')
})

app.listen(port, () => {
    console.log('Server is running on ' + port)
})