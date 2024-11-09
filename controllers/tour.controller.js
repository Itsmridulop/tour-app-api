const Tour = require('../model/tour.model')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')
const multer = require('multer')
const sharp = require('sharp')

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true)
    else cb(new AppError('Not an image! Please upload only images.', 400), false)
}

const upload = multer({ storage: multerStorage, fileFilter: multerFilter })

exports.uploadTourImage = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images' }
])

exports.resizeTourImage = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover && !req.files.images) return next()
    if (req.files.imageCover) {
        req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpg`;
        await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat('jpg').jpeg({ quality: 90 }).toFile(`public/img/tours/${req.body.imageCover}`)
    }
    if (req.files.images) {
        req.body.images = []
        await Promise.all(req.files.images.map(async (file, idx) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${idx + 1}.jpg`
            await sharp(file.buffer).resize(2000, 1333).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/tours/${filename}`);
            req.body.images.push(filename)
        }))
    }
    next()
})

exports.topTours = async (req, _, next) => {
    req.query.sort = '-ratingsAverage,price'
    req.query.limit = 5
    next()
}

exports.tourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: '$difficulty',
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                numRatings: { $sum: '$ratingsQuantity' },
                numTours: { $sum: 1 }
            }
        },
        {
            $sort: { avgRating: -1 }
        }
    ])
    res.status(200).json({
        status: 'success',
        data: stats
    })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: { $gte: new Date('2021-01-01'), $lte: new Date('2021-12-31') }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTour: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { month: 1 }
        }
    ])
    res.status(200).json({
        status: 'success',
        results: plan.length,
        data: plan
    })
})

exports.getDistance = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',')
    if (!lng || !lat) next(AppError('Please provide longitude and latitude in a proper order (lat,lng)'))
    const multipler = unit === 'mi' ? 0.000621371 : 0.001

    const distance = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultipler: multipler
            },
            $project: {
                name: 1,
                distance: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        results: distance.length,
        data: distance
    })
})

exports.gettoursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',')
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1
    if (!lng || !lng) next(AppError('Please provide longitude and latitude in a proper order (lat,lng)'))
    const tour = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    })

    res.status(200).json({
        status: 'success',
        results: tour.length,
        data: tour
    })
})

exports.getTours = factory.getAll(Tour)
exports.deleteTour = factory.deleteOne(Tour)
exports.getOneTour = factory.getOne(Tour, { path: 'reviews' })
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
