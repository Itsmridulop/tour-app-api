const { Schema, model } = require('mongoose')

const BookingSchema = new Schema({
    tour: {
        type: Schema.ObjectId,
        ref: 'Tour',
        require: [true, 'A Booking must belongs to a tour']
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        require: [true, 'A Booking must belongs to a user']
    },
    members: {
        type: Number,
        require: [true, 'A Booking must have a number of members'],
        min: [1, 'Booking must a done for atleast one memeber']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paidAt: {
        type: Date
    },
    canceledAt: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: {
            values: ['credit-card', 'cash', 'UPI'],
            message: 'We accept only Credit Card, Cash and UPI for payment'
        },
        require: [true, 'Please select one of the payment methods']
    },
    status: {
        type: String,
        enum: {
            values: ['booked', 'canceled', 'completed', 'paid', 'confirmed'],
            message: 'Booking status must be either booked, canceled, paid, confirmed or completed'
        },
        default: 'booked'
    },
    paid: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

BookingSchema.index({ tour: 1, user: 1 }, { unique: true })

BookingSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'tour',
        select: 'name startDates'
    })
    next()
})

module.exports = model('Booking', BookingSchema)
