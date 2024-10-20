const Review = require('../model/review.model')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')

exports.getDailyReview = catchAsync(async (req, res, next) => {
    req.query.createdAt = req.query.date && Date.now()
    next()
})

exports.getAllReview = factory.getAll(Review)
exports.createReview = factory.createOne(Review)
exports.deleteReview = factory.deleteOne(Review)
exports.updateReview = factory.updateOne(Review)