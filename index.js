const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const config = require("config");
const users = require("./routes/users");
const profile = require("./routes/profile");
const userContacts = require("./routes/usercontacts");
const app = express();

if (!config.get("mongodbSeverLink")) {
  console.error("FATAL ERROR: mongodbSeverLink is not defined");
  process.exit(1);
}
// const mongoURI = "mongodb://localhost/FB_LIMIT";
const mongoURI = config.get("mongodbSeverLink");

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("mongoDB connected..."))
  .catch((err) => console.log("Could not connect to MongoDB...  :" + err));

app.use(express.json());

app.use("/api/users", users);
app.use("/api/usercontacts", userContacts);
app.use("/api/profile", profile);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports.mongoURI = mongoURI;
