const morgan = require('morgan')
const express = require('express')
const userRouter = require('./routers/user.router')
const tourRouter = require('./routers/tour.router')

const app = express()

app.use(express.json())
app.use(morgan('dev'))

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    })
    next()
})

module.exports = app