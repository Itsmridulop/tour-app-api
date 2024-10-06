const Tour = require('../model/tour.model')
const APIFeatures = require('../utils/APIFeatures')

exports.topTours = async (req, _, next) => {
    req.query.sort = '-ratingsAverage,price'
    req.query.limit = 5
    next()
}

exports.getTours = async (req, res) => {
    try {
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().fieldSelect().pagination()
        const tours = await features.query
        res.status(200).json({
            status: "success",
            results: tours.length,
            data: tours
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}

exports.getOneTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
        res.status(200).json({
            status: "success",
            data: tour
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}

exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body)
        res.status(200).json({
            status: 'success',
            data: newTour
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        })
    }
}

exports.updateTour = async (req, res) => {
    try {
        const udatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        res.status(200).json({
            status: 'success',
            data: udatedTour
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id)
        res.status(204).send('Tour is deleted successfully.')
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}

exports.tourStats = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try {
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
                $addFields: { month: '$_id'}
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
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message
        })
    }
}