const morgan = require('morgan')
const express = require('express')
const userRouter = require('./routers/user.router')
const tourRouter = require('./routers/tour.router')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/error.controller')
const rateLimiit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')

const app = express()

const limiter = rateLimiit({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: 'Too many request, please try again after an hour'
})

app.use(helmet())
app.use(express.json({ limit: '10kb' }))
app.use(mongoSanitize())
app.use(xss())
app.use(hpp({
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price'],
}))
app.use(morgan('dev'))
app.use('/api', limiter)

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app