const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty']
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// working
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
// reviewSchema.createIndex({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

reviewSchema.statics.calcAverageRating = async function(tourId) {
    const stats = await this.aggregate([{
        $match: { tour: tourId }
    }, {
        $group: {
            _id: '$tour',
            nRating: { $sum: 1 },
            avgRating: { $avg: '$rating' }
        }
    }]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingAverage: stats[0].avgRating,
            ratingQuantity: stats[0].nRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingAverage: 0,
            ratingQuantity: 4.5,
        });
    }

};

reviewSchema.post('save', function() {
    // this points to current review
    this.constructor.calcAverageRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
    // this points to current review
    this.r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); does not work here because query has been excuted
    await this.r.constructor.calcAverageRating(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;