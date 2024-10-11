const jwt = require('jsonwebtoken')
const User = require('../model/user.model')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

const { promisify } = require('util')

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        photo: req.body.photo,
        role: req.body.role,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    })
    const token = signToken(newUser._id)
    res.status(201).json({
        status: 'success',
        token,
        data: {
            name: newUser.name,
            email: newUser.email,
            photo: newUser.photo,
            role: newUser.role,
        }
    })
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) return next(new AppError('Please enter a email and password.', 400))
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.correctPassword(password, user.password))) return next(new AppError('Invalid email or password.', 401))
    const token = signToken(user._id)
    res.status(200).json({
        status: 'success',
        token
    })
})

exports.protect = catchAsync(async (req, res, next) => {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    if (!token) return next(new AppError('you are not authorized.', 401))
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    const currentUser = await User.findById(decode.id)
    if (!currentUser) return next(new AppError('This user is no longer exsit.', 401))
    if (currentUser.isPasswordChaned(decode.iat)) return next(new AppError('This password is no longer valid.', 401))
    console.log(req)
    req.user = currentUser
    next()
})

exports.restrictTo = (...roles) => {
    return catchAsync(async (req, res, next) => {
        if (!roles.includes(req.user.role)) return next(new AppError('Permisson denided', 403))
        next()
    })
}