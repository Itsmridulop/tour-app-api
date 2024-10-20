const APIFeatures = require('../utils/APIFeatures')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.deleteOne = model => catchAsync(async (req, res, next) => {
    const document = await model.findByIdAndDelete(req.params.id)
    if (!document) return next(new AppError('No document found', 404))
    res.status(204).json({
        status: 'success',
        message: `${model} successfully deleted`
    })
})


exports.updateOne = model => catchAsync(async (req, res, next) => {
    const udatedTour = await model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!udatedTour) return next(new AppError('No document found', 404))
    res.status(200).json({
        status: 'success',
        data: udatedTour
    })
})

exports.createOne = model => catchAsync(async (req, res, next) => {
    const newReview = await model.create({ ...req.body, user: req.user.id, tour: req.params.tourId })
    res.status(201).json({
        status: 'success',
        data: newReview
    })
})

exports.getOne = (model, populate) => catchAsync(async (req, res, next) => {
    let features = new APIFeatures(model.findById(req.params.id || req.user.id), req.query).filter().fieldSelect()
    if(populate) features.query = features.query.populate(populate)
    const document = await features.query
    if (!document) return next(new AppError('No document found', 404))
    res.status(200).json({
        status: 'success',
        data: document
    })
})

exports.getAll = model => catchAsync(async (req, res, next) => {
    const features = new APIFeatures(model.find(), req.query).filter().fieldSelect().sort().pagination()
    const document = await features.query
    res.status(200).json({
        status: 'success',
        resutls: document.length,
        data: document
    })
})
