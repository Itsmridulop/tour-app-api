const Review = require('../model/review.model')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')

exports.getDailyReview = catchAsync(async (req, res, next) => {
    req.query.createdAt = req.query.date && Date.now()
    next()
})

exports.getReviewOfUser = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({ user: req.params.id })
    if(!reviews) next(new AppError('This user dont reviewwed any tour', 400))
    res.status(200).json({
        status: 'success',
        result: reviews.length,
        data: reviews
    })
})

exports.getAllReview = factory.getAll(Review)
exports.createReview = factory.createOne(Review)
exports.deleteReview = factory.deleteOne(Review)
exports.updateReview = factory.updateOne(Review)
