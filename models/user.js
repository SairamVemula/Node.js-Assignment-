const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");
// const picSchema = new mongoose.Schema({
//   picId: String,
//   filename: String,
// });
const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  profile_pic: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profile_pic: {
    type: String,
    // default:
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    maxlength: 10,
    minlength: 10,
  },
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fname: this.fname,
      lname: this.lname,
      email: this.email,
    },
    config.get("jwtPrivateKey")
  );
};
const User = mongoose.model("Users", userSchema);
function validateRegister(user) {
  const schema = {
    fname: Joi.string().required().min(5).max(255),
    lname: Joi.string().required().min(5).max(255),
    email: Joi.string().required().min(5).max(255).email(),
    password: Joi.string().required().min(5).max(255),
    mobile: Joi.string().required().min(10).max(10),
  };
  return Joi.validate(user, schema);
}

function validateLogin(user) {
  const schema = {
    email: Joi.string().required().min(5).max(255).email(),
    password: Joi.string().required().min(5).max(255),
  };
  return Joi.validate(user, schema);
}

exports.userSchema = userSchema;
// exports.picSchema = picSchema;
exports.User = User;
exports.validateRegister = validateRegister;
exports.validateLogin = validateLogin;
