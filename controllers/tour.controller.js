const Tour = require('../model/tour.model')
const APIFeatures = require('../utils/APIFeatures')
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

exports.getTours = factory.getAll(Tour)
exports.deleteTour = factory.deleteOne(Tour)
exports.getOneTour = factory.getOne(Tour, { path: 'reviews' })
// exports.getOneTour = catchAsync(async (req, res, next) => {
//     const features = new APIFeatures(Tour.findById(req.params.id).populate('reviews'), req.query).filter().fieldSelect()
//     const tour = await features.query
//     if (!tour) return next(new AppError('No tour found', 404))
//     res.status(200).json({
//         status: "success",
//         data: tour
//     })
// })
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)