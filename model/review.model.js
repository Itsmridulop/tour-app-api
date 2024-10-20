const { Schema, model } = require('mongoose')

const reviewSchema = new Schema({
    rating: {
        type: Number,
        required: [true, 'Please give some rating to this tour.'],
        min: [1, 'Rating must be at least 1.'],
        max: [5, 'Maximum rating is only 5.']
    },
    review: {
        type: String,
        required: [true, 'Please give a review to this tour.']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    },
    tour: {
        type: Schema.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

reviewSchema.pre(/^find/, function (next) {
    console.log(this._conditions.tour)
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    if (!this._conditions.tour)
        this.populate({
            path: 'tour',
            select: 'name'
        })
    next()
})

module.exports = model('Review', reviewSchema)