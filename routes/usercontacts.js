const _ = require("lodash");
const express = require("express");
const router = express.Router();
const { UserContacts, validateRequest } = require("../models/usercontacts");
const auth = require("../middleware/auth");

//List of all Friends
router.get("/friends", auth, async (req, res) => {
  let friends = await UserContacts.findOne({ userId: req.user._id }).select(
    "friends"
  );
  if (!friends) return res.send("No Friends");

  res.send(friends);
});
//Send Request
router.post("/friendRequest", auth, async (req, res) => {
  const { error } = validateRequest(req.body);
  if (error) return res.status(400).send(error);

  let userContacts = await UserContacts.findOne({ userId: req.body.requestID });
  if (!userContacts) return res.send("no usercontants with that ID ");
  // res.send(userContacts);
  userContacts.pending.push(req.body.requestID);
  userContacts.save();
  res.send({ message: "Request Sent", userId: req.body.requestID });
});
//Request Accept
router.post("/requestAccept", auth, async (req, res) => {
  let userContacts = await UserContacts.findOne({ userId: req.user._id });
  if (!userContacts) return res.send("no usercontants ");

  const { error } = validateRequest(req.body);
  if (error) return res.status(400).send(error);

  userContacts.friends.push(req.body.requestID);
  const index = userContacts.pending.indexOf(req.body.requestID);
  if (index < 0) return res.send("Friend Request not Found");

  userContacts.pending.splice(index, 1);
  userContacts.save();
  res.send({ message: "Friend Request Accepted", userId: req.body.requestID });
});
//Rejected Request
router.post("/requestReject", auth, async (req, res) => {
  let userContacts = await UserContacts.findOne({ userId: req.user._id });
  if (!userContacts) return res.send("no usercontants ");

  const { error } = validateRequest(req.body);
  if (error) return res.status(400).send(error);

  const index = userContacts.pending.indexOf(req.body.requestID);
  if (index < 0) return res.send("Friend Request not Found");

  userContacts.pending.splice(index, 1);
  userContacts.save();
  res.send({ message: "Friend Request Rejected", userId: req.body.requestID });
});
//Unfriend
router.post("/unfriend", auth, async (req, res) => {
  let userContacts = await UserContacts.findOne({ userId: req.user._id });
  if (!userContacts) return res.send("no usercontants ");

  const { error } = validateRequest(req.body);
  if (error) return res.status(400).send(error);

  const index = userContacts.friends.indexOf(req.body.requestID);
  if (index < 0) return res.send("Friend not Found");
  userContacts.friends.splice(index, 1);
  userContacts.save();
  res.send({ message: "Unfriended", userId: req.body.requestID });
});
module.exports = router;
