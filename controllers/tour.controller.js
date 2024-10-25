const Tour = require('../model/tour.model')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')

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