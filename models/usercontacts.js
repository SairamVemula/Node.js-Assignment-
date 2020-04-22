const mongoose = require("mongoose");
const Joi = require("joi");
const userContactsSchema = new mongoose.Schema({
  userId: String,
  pending: [String],
  friends: [String],
  status: Boolean,
});

const UserContacts = mongoose.model("UsersContacts", userContactsSchema);

function validateUserContants(user) {
  const schema = {
    userId: Joi.string().objectId(),
    pending: Joi.array().string().objectId(),
    friends: Joi.array().string().objectId(),
    status: Joi.boolean(),
  };
  return Joi.validate(user, schema);
}
function validateRequest(user) {
  const schema = {
    requestID: Joi.objectId(),
  };
  return Joi.validate(user, schema);
}

exports.userSchema = userContactsSchema;
exports.UserContacts = UserContacts;
exports.validate = validateUserContants;
exports.validateRequest = validateRequest;
