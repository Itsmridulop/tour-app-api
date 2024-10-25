const { Schema, model } = require('mongoose')
const Tour = require('./tour.model')

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

reviewSchema.index({ user: 1, tour: 1 }, {
    unique: true
})

reviewSchema.statics.calAverageRating = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                avgRating: { $avg: '$rating' },
                nRating: { $sum: 1 }
            }
        }
    ])
    console.log(stats)
    if (stats[0].length > 0) {
        console.log('if')
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].nRating
        })
    } else {
        console.log('else')
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0
        })
    }
}

reviewSchema.post('save', function () {
    this.constructor.calAverageRating(this.tour)
})

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.reviewData = await this.findOne()
    next()
})

reviewSchema.post(/^findOneAnd/, async function() {
    if(this.reviewData) await this.reviewData.constructor.calAverageRating(this.reviewData.tour)
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