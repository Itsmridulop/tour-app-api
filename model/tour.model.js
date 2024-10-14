// const User = require('../model/user.model')

const { Schema, model } = require('mongoose');
const { default: slugify } = require('slugify');

const tourSchema = Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: [true, 'Name must be unique for each tour'],
        trim: true,
        maxlength: [40, 'Name must be greater then 40 character'],
        minlength: [10, 'Name must be greater then 10 character']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1'],
        max: [5, 'Rating must be below 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    discount: {
        type: Number,
        validate: {
            validator: function (val) {
                return this.price > val
            },
            message: 'Discount must be lesser then accual price.'
        }
    },
    summary: {
        type: String,
        required: [true, 'A tour must have a summary'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'A tour must have a description'],
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have an image cover']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        description: String,
        day: Number
    }],
    guides: [{
        type: Schema.ObjectId,
        ref: 'User'
    }]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

tourSchema.virtual('durationWeek').get(function () {
    return this.duration / 7;
})

tourSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'tour'
})

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next()
})

// this code is to embed all data of related guide in tours document

// tourSchema.pre('save', async function(next) {
//     const guidesPromise = this.guides.map(async id => await User.findById(id).select(['name', 'email', 'role']))
//     this.guides = await Promise.all(guidesPromise)
//     next()
// })

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next()
})

tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    next();
})

tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    next()
})

module.exports = model('Tour', tourSchema);