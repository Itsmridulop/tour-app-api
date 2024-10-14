const Tour = require('../model/tour.model')
const APIFeatures = require('../utils/APIFeatures')
const AppError = require('../utils/appError')
const User = require('../model/user.model')
const catchAsync = require('../utils/catchAsync')

exports.topTours = async (req, _, next) => {
    req.query.sort = '-ratingsAverage,price'
    req.query.limit = 5
    next()
}

exports.getTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().fieldSelect().pagination()
    const tours = await features.query
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: tours
    })
})

exports.getOneTour = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.findById(req.params.id).populate('reviews'), req.query).filter().fieldSelect()
    const tour = await features.query
    if (!tour) return next(new AppError('No tour found', 404))
    res.status(200).json({
        status: "success",
        data: tour
    })
})

exports.createTour = catchAsync(async (req, res, next) => {
    const users = await User.find({
        email: { $in: req.body.guides },
        role: { $in: ['guide', 'lead-guide'] }
    }).select('_id email')
    const emailToUserIdMap = users.reduce((acc, user) => {
        acc[user.email] = user._id
        return acc
    }, {})
    req.body.guides = req.body.guides.map(email => {
        if (!emailToUserIdMap[email]) {
            return next(new AppError(`Invalid email: ${email}`, 400))
        }
        return emailToUserIdMap[email]
    })
    const newTour = await Tour.create(req.body)
    res.status(201).json({
        status: 'success',
        data: newTour
    })
})


exports.updateTour = catchAsync(async (req, res, next) => {
    const udatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!udatedTour) return next(new AppError('No tour found', 404))
    res.status(200).json({
        status: 'success',
        data: udatedTour
    })
})

exports.deleteTour = catchAsync(async (req, res, next) => {
    if (!await Tour.findByIdAndDelete(req.params.id)) return next(new AppError('No Tour found', 404))
    res.status(204).json({
        status: "success",
        message: "Tour is deleted successfully."
    })
})

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