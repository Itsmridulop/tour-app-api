const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const User = require('../model/user.model')

const filter = (obj, ...allowedField) => {
    const filtered = {}
    Object.keys(obj).forEach((el) => {
        if (allowedField.includes(el)) {
            filtered[el] = obj[el]
        }
    })
    return filtered
}

exports.getUsers = catchAsync(async (req, res) => {
    const user = await User.find({active: true})
    res.status(200).json({
        status: 'success',
        results: user.length,
        data: user
    }) 
})

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) return next(new AppError('Unable to update your password.', 400))
    const filteredBody = filter(req.body, 'name', 'email')
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true })
    res.status(200).json({
        status: 'success',
        data: updatedUser
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })
    res.status(204).json({
        status: 'success',
        message: 'Your account is deleted successfully.'
    })
})

exports.getOneUser = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: '<DATA OF ONE USER>'
    })
}

exports.createUser = (req, res) => {
    res.status(201).json({
        status: 'success',
        data: '<DATA OF NEW USER>'
    })
}

exports.updateUser = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: '<DATA OF UPDATED USER>'
    })
}

exports.deleteUser = (req, res) => {
    res.status(204).send('User is deleted successfully.')
}