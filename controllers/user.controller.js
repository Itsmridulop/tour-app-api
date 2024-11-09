const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const User = require('../model/user.model')
const factory = require("./handlerFactory")
const multer = require('multer')
const sharp = require("sharp")
const { assign } = require("nodemailer/lib/shared")

// Set how and where files are stored on the system
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users') // Location for storing uploaded user images
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1]
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`) // Naming convention: user-ID-currentTimestamp.fileExtension
//     }
// })

// set image to mwmory (RAM) as buffer
const multerStorage = multer.memoryStorage()


// Check if the uploaded file is an image
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true) // Accept file if it’s an image
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false) // Reject if not an image
    }
}

// Initialize multer with a specified destination for user image uploads
const upload = multer({ storage: multerStorage, fileFilter: multerFilter })

// resize and format image to jpg
exports.resizeImage = catchAsync(async (req, res, next) => {
    if(!req.file) return next()
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpg`
    await sharp(req.file.buffer).resize(500, 500).toFormat('jpg').jpeg({quality: 100}).toFile(`public/img/users/${req.file.filename}`)
    next()
})

// Middleware to handle single file upload for 'photo' field
exports.uploadUserImage = upload.single('photo')

// Filters an object to only include allowed fields
const filter = (obj, ...allowedField) => {
    const filtered = {}
    Object.keys(obj).forEach((el) => {
        if (allowedField.includes(el)) {
            filtered[el] = obj[el]
        }
    })
    return filtered
}

// Update current user’s profile (name and photo only, no password update)
exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) return next(new AppError('Unable to update your password.', 400))
    const filteredBody = filter(req.body, 'name', 'photo')
    if(req.file) filteredBody.photo = req.file.filename
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true })
    res.status(200).json({
        status: 'success',
        data: updatedUser
    })
})

// Soft delete current user by setting account status to inactive
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })
    res.status(204).json({
        status: 'success',
        message: 'Your account is deleted successfully.'
    })
})

// Controller factory functions to handle CRUD operations for users
exports.getMe = factory.getOne(User) // Get current user's profile
exports.getUsers = factory.getAll(User) // Get all users
exports.getOneUser = factory.getOne(User) // Get a single user by ID
exports.createUser = factory.createOne(User) // Create a new user
exports.updateUser = factory.updateOne(User) // Update a user's details by admin
exports.deleteUser = factory.deleteOne(User) // Hard delete a user (admin only)
