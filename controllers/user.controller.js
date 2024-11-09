const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const User = require('../model/user.model')
const factory = require("./handlerFactory")

const filter = (obj, ...allowedField) => {
    const filtered = {}
    Object.keys(obj).forEach((el) => {
        if (allowedField.includes(el)) {
            filtered[el] = obj[el]
        }
    })
    return filtered
}

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) return next(new AppError('Unable to update your password.', 400))
    const filteredBody = filter(req.body, 'name', 'photo')
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

exports.getMe = factory.getOne(User)
exports.getUsers = factory.getAll(User)
exports.getOneUser = factory.getOne(User)
exports.createUser = factory.createOne(User)
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
