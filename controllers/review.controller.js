const Review = require('../model/review.model')
const factory = require('./handlerFactory')

exports.getAllReview = factory.getAll(Review)
exports.createReview = factory.createOne(Review)
exports.deleteReview = factory.deleteOne(Review)
exports.updateReview = factory.updateOne(Review)