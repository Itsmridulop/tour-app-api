const morgan = require('morgan')
const express = require('express')
const userRouter = require('./routers/user.router')
const tourRouter = require('./routers/tour.router')
const reviewRouter = require('./routers/review.router')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/error.controller')
const rateLimiit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

const app = express()

const limiter = rateLimiit({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: 'Too many request, please try again after an hour'
})

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
                baseUri: ["'self'"],
                fontSrc: ["'self'", 'https:', 'data:'],
                scriptSrc: [
                    "'self'",
                    'https:',
                    'http:',
                    'blob:',
                    'https://*.mapbox.com',
                    'https://js.stripe.com',
                    'https://m.stripe.network',
                    'https://*.cloudflare.com',
                ],
                frameSrc: ["'self'", 'https://js.stripe.com'],
                objectSrc: ["'none'"],
                styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
                workerSrc: [
                    "'self'",
                    'data:',
                    'blob:',
                    'https://*.tiles.mapbox.com',
                    'https://api.mapbox.com',
                    'https://events.mapbox.com',
                    'https://m.stripe.network',
                ],
                childSrc: ["'self'", 'blob:'],
                imgSrc: ["'self'", 'data:', 'blob:'],
                formAction: ["'self'"],
                connectSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    'data:',
                    'blob:',
                    'https://*.stripe.com',
                    'https://*.mapbox.com',
                    'https://*.cloudflare.com/',
                    'https://bundle.js:*',
                    'ws://127.0.0.1:*/',
                ],
                upgradeInsecureRequests: [],
            },
        },
    })
)
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
app.use('/api/v1/reviews'  , reviewRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app