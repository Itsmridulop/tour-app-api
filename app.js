// CREATING A LAYOUT FINAL IMPLEMENTATION IS AFTER ADDING MONGO

const fs = require('fs')
const morgan = require('morgan')
const express = require('express')
const userRouter = require('./routers/user.router')
const tourRouter = require('./routers/tour.router')

const app = express()

app.use(express.json())
app.use(morgan('dev'))

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

module.exports = app