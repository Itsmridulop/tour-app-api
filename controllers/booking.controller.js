const factory = require('./handlerFactory')
const Booking = require('../model/booking.model')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.getBookingOfOneUser = catchAsync(async (req, res, next) => {
    const booking = await Booking.find({ user: req.user.id })
    if (!booking) next(new AppError('No bookings by this user.', 400))
    res.status(200).json({
        status: 'success',
        result: booking.length,
        data: booking
    })
})

exports.getBookingOfUser = catchAsync(async (req, res, next) => {
    const booking = await Booking.find({ user: req.params.id })
    if (!booking) next(new AppError('No bookings by this user.', 400))
    res.status(200).json({
        status: 'success',
        result: booking.length,
        data: booking
    })
})

exports.createBooking = factory.createOne(Booking)
exports.getAllBooking = factory.getAll(Booking)
exports.getOneBooking = factory.getOne(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)
