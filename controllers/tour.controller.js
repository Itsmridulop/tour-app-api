const Tour = require("../model/tour.model");
const User = require("../model/user.model");
const cloudinary = require("cloudinary").v2;
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const streamifier = require("streamifier");
const sharp = require("sharp");
const axios = require("axios");
const upload = require("../cloudinary.config");

exports.getRecommendedTours = catchAsync(async (req, res, next) => {
  try {
    const tourName = req.user?.resentBooked ?? "all";
    const response = await axios.get("http://localhost:8000/recommend", {
      params: { tour_name: tourName },
      headers: {
        "Content-Type": "application/json",
      },
    });
    res.status(200).json({
      status: "success",
      data: response.data,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
});

exports.uploadTourImage = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images" },
]);

exports.resizeTourImage = catchAsync(async (req, res, next) => {
  try {
    if (!req.files.imageCover && !req.files.images) return next();
    if (req.files.imageCover) {
      const filename = `tour-${req.params.id}-${Date.now()}-cover.jpg`;
      const buffer = await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat("jpg")
        .jpeg({ quality: 100 })
        .toBuffer();
      await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image", public_id: filename },
          (error, uploadedImage) => {
            if (error) return reject(error);
            req.body.imageCover = uploadedImage.secure_url;
            resolve();
          },
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    }

    if (req.files.images) {
      req.body.images = req.body.images.concat(
        await Promise.all(
          req.files.images.map(async (file, idx) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${idx + 1}.jpg`;
            const buffer = await sharp(file.buffer)
              .resize(2000, 1333)
              .toFormat("jpeg")
              .jpeg({ quality: 100 })
              .toBuffer();
            return new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { resource_type: "image", public_id: filename },
                (error, uploadedImage) => {
                  if (error) return reject(error);
                  resolve(uploadedImage.secure_url);
                },
              );
              streamifier.createReadStream(buffer).pipe(stream);
            });
          }),
        ),
      );
    }
    next();
  } catch (error) {
    return next(error);
  }
});

exports.FindGuideId = catchAsync(async (req, res, next) => {
  if (!req.body.guide) return next();
  const guideArr = await Promise.all(
    req.body.guides.map(async (guide) => {
      const guideDoc = await User.findOneAndUpdate(
        { email: guide.email },
        { $addToSet: { tour: req.params.id } },
        { new: true },
      );
      if (!guideDoc)
        next(new AppError(`${guide.email} this email does not exist.`, 404));
      return guideDoc;
    }),
  );
  guideArr.map((guide, index) => {
    if (guide.role !== "guide" && guide.role !== "lead-guide")
      next(new AppError("Entered email does not belongs to any guide.", 400));
    req.body.guides[index] = guide._id;
  });
  next();
});

exports.topTours = async (req, _, next) => {
  req.query.sort = "-ratingsAverage,price";
  req.query.limit = 5;
  next();
};

exports.tourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: "$difficulty",
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        numRatings: { $sum: "$ratingsQuantity" },
        numTours: { $sum: 1 },
      },
    },
    {
      $sort: { avgRating: -1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date("2021-01-01"),
          $lte: new Date("2021-12-31"),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTour: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { month: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    results: plan.length,
    data: plan,
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  if (!lng || !lat)
    next(
      AppError(
        "Please provide longitude and latitude in a proper order (lat,lng)",
      ),
    );
  const multipler = unit === "mi" ? 0.000621371 : 0.001;

  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultipler: multipler,
      },
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: distance.length,
    data: distance,
  });
});

exports.gettoursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  if (!lng || !lng)
    next(
      AppError(
        "Please provide longitude and latitude in a proper order (lat,lng)",
      ),
    );
  const tour = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: "success",
    results: tour.length,
    data: tour,
  });
});

exports.getTours = factory.getAll(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getOneTour = factory.getOne(Tour, { path: "reviews" });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
