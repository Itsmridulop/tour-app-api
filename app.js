const morgan = require('morgan')
const express = require('express')
const userRouter = require('./routers/user.router')
const tourRouter = require('./routers/tour.router')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/error.controller')

const app = express()

app.use(express.json())
app.use(morgan('dev'))

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app