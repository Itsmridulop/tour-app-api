const AppError = require('../utils/appError')
const APIFeatures = require('../utils/APIFeatures')
const catchAsync = require('../utils/catchAsync')
const Review = require('../model/review.model')

exports.getAllReview = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Review.find(), req.query).fieldSelect().filter().pagination().sort()
    const review = await features.query
    res.status(200).json({
        status: 'success',
        resutls: review.length,
        data: review
    })
})

exports.createReview = catchAsync(async (req, res, next) => {
    const newReview = await Review.create({...req.body, user: req.user.id})
    res.status(201).json({
        status: 'success',
        data: newReview
    })
})