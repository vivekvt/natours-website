const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async(req, res, next) => {
    //  1 get tour data from collection
    const tours = await Tour.find();
    // 2 build template
    // 3 Render that template using tour data from 1
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async(req, res, next) => {
    // get data for the requested tour include reviews and tour guide
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour by that name', 404));
    }

    // 2 Build Template
    // 3 Render Data 
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Login',
    });
};

exports.getSignupForm = (req, res) => {
    res.status(200).render('signup', {
        title: 'Sign up',
    });
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your Account',
    });
};

exports.getMyTours = catchAsync(async(req, res, next) => {
    // 1 find bookings
    const bookings = await Booking.find({ user: req.user.id });
    // 2 find tours with the return IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });
    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    });
});

exports.updateUserData = catchAsync(async(req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });
    res.status(200).render('account', {
        title: 'Your Account',
        user: updatedUser
    });
});