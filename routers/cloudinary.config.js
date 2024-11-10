const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')
const AppError = require('./utils/appError')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) cb(null, true)
    else cb(new AppError('Not an image! Please upload only images.', 400), false)
}

const upload = multer({storage: storage, fileFilter: multerFilter})
module.exports = upload; 
