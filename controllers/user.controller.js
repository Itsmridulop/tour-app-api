const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const User = require('../model/user.model')
const Tour = require('../model/tour.model')
const factory = require("./handlerFactory")
const cloudinary = require('cloudinary').v2
const sharp = require("sharp")
const upload = require('../cloudinary.config')

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

// Middleware to handle single file upload for 'photo' field
exports.uploadUserImage = upload.single('photo')

// resize and format image to jpg
exports.resizeImage = catchAsync(async (req, res, next) => {
    try {
        if (!req.file) return next();

        // Generate a filename
        const filename = `user-${req.user.id}-${Date.now()}.jpg`;

        // Resize image using sharp and get buffer
        const buffer = await sharp(req.file.buffer).resize(500, 500).toFormat('jpg').jpeg({ quality: 100 }).toBuffer();

        // Upload buffer to Cloudinary
        const result = cloudinary.uploader.upload_stream(
            { resource_type: 'image', public_id: filename },
            (error, uploadedImage) => {
                if (error) return next(error);

                // Attach Cloudinary URL to req.file for further processing
                req.body.photo = uploadedImage.secure_url;
                next();
            }
        );

        // Use sharp buffer as input for Cloudinary upload stream
        require('streamifier').createReadStream(buffer).pipe(result);

    } catch (error) {
        return next(error);
    }
})


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

exports.getAssociatedTour = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if(!user) return next(new AppError('User not found', 404))
    if(user.role === 'guide' || user.role === 'lead-guide') {
        await user.populate({
            path: 'tour',
            select: 'name duration difficulty maxGroupSize price summary imageCover startLocation'
        })
        res.status(200).json({
            status: 'success',
            data: user
        })
    }
})

// Controller factory functions to handle CRUD operations for users
exports.getMe = factory.getOne(User) // Get current user's profile
exports.getUsers = factory.getAll(User) // Get all users
exports.getOneUser = factory.getOne(User) // Get a single user by ID
exports.createUser = factory.createOne(User) // Create a new user
exports.updateUser = factory.updateOne(User) // Update a user's details by admin
exports.deleteUser = factory.deleteOne(User) // Hard delete a user (admin only)
