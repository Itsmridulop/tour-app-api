const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const crypto = require("crypto");

const { promisify } = require("util");

async function cleanupExpiredPasswordResetTokens() {
  await User.updateMany(
    { passwordResetExpires: { $lte: Date.now() } },
    { $unset: { passwordResetToken: "", passwordResetExpires: "" } },
  );
}

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    // secure: req.protocol === 'https',
  };
  res.cookie("token", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      name: user.name,
      email: user.email,
      photo: user.photo,
      role: user.role,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return next(
      new AppError("Email already in use, please try to login.", 400),
    );
  }
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    role: req.body.role,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  // await new Email(newUser, " http://localhost:5173/").sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Please enter a email and password.", 400));
  const user = await User.findOne({ email })
    .select("+password")
    .select("+active");
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Invalid email or password.", 401));
  if (!user.active) {
    user.active = true;
    await user.save({ validateBeforeSave: false });
  }
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token.length === 0) {
    console.log("test1");
    return next(new AppError("you are not authorized.", 401));
  }
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findOne({ _id: decode.id, active: true });
  if (!currentUser)
    return next(new AppError("This user is no longer exsit.", 401));
  if (currentUser.isPasswordChaned(decode.iat))
    return next(new AppError("This password is no longer valid.", 401));
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError("Permisson denided", 403));
    next();
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("This email is not registered.", 404));
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://localhost:5173/resetPassword/${resetToken}`;
  try {
    await new Email(user, resetUrl).sendPasswordReset();
    setInterval(cleanupExpiredPasswordResetTokens, 60 * 1000);
    res.status(200).json({
      status: "success",
      message: "Check your email to reset your password",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });
    return next(new AppError("Error sending email", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashResetPassword = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashResetPassword,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError("Your session is expired.", 400));
  (user.password = req.body.password),
    (user.confirmPassword = req.body.confirmPassword),
    (user.passwordResetToken = undefined),
    (user.passwordResetExpires = undefined);
  await user.save();
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.correctPassword(req.body.password, user.password)))
    return next(new AppError("Invalid Password.", 401));
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.newPasswordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});
