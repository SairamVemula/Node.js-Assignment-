const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validateRegister, validateLogin } = require("../models/user");
const { UserContacts } = require("../models/usercontacts");
const auth = require("../middleware/auth");
const router = express.Router();

//Get All User
router.get("/allUsers", async (req, res) => {
  let users = await User.find().select("-email -password -mobile");
  if (!users) return res.send({ message: "No User Found" });
  res.send(users);
});
//Registering

router.post("/register", async (req, res) => {
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).send(error);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("Email is already registered...");

  user = await User.findOne({ mobile: req.body.mobile });
  if (user) return res.status(400).send("Mobile no is already registered...");

  user = new User({
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    password: req.body.password,
    mobile: req.body.mobile,
    profile_pic: "none",
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  // console.log(await bcrypyt.compare(req.body.password, user.password));
  const userContacts = new UserContacts({ userId: user._id });
  await userContacts.save();
  await user.save();
  res.send(_.pick(user, ["_id", "fname", "lname", "email", "mobile"]));
});

//Login

router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid Email or Password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid  Password");

  const token = user.generateAuthToken();
  // console.log(token);
  res.send(token);
});

module.exports = router;
