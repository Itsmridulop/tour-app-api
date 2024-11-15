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
    numMember: {
        type: Number,
        require: [true, 'A Booking must have a number of members'],
        min: [1, 'Booking must a done for atleast one memeber']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

module.exports = model('Booking', BookingSchema)
