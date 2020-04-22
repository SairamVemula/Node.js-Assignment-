const express = require("express");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const router = express.Router();
const auth = require("../middleware/auth");
const { User } = require("../models/user");
const config = require("config");
// const { mongoURI } = require("../index");

// const mongoURI = "mongodb://localhost/FB_LIMIT";
const mongoURI = config.get("mongodbSeverLink");

const conn = mongoose.createConnection(mongoURI);

let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("profile_pic");
});

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "profile_pic",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

router.post("/upload", [auth, upload.single("file")], async (req, res) => {
  let user = await User.findById(req.user._id);
  if (!user) return res.status(400).send({ message: "No User Login" });
  if (user.profile_pic !== "none") {
    gfs.remove({ filename: user.profile_pic, root: "profile_pic" }, function (
      err,
      gridStore
    ) {
      if (err) return handleError(err);
      console.log("success");
    });
  }
  // console.log(req.file);
  user.profile_pic = req.file.filename;
  await user.save();
  res.send({
    message: "Profile Picture Updated",
  });
});

router.get("/image", auth, async (req, res) => {
  let user = await User.findById(req.user._id);
  if (!user) return res.status(400).send({ message: "No User Login" });
  gfs.files.findOne({ filename: user.profile_pic }, (err, file) => {
    if (!file || file.length === 0)
      return res.status(400).json({ err: "no files exists" });
    if (
      file.contentType === "image/jpeg" ||
      file.contentType === "image/png" ||
      file.contentType === "image/jpg"
    ) {
      var readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({ err: "Not Found" });
    }
  });
});

router.delete("/delete", auth, async (req, res) => {
  let user = await User.findById(req.user._id);
  if (!user) return res.status(400).send({ message: "No User Login" });
  if (user.profile_pic !== "none") {
    gfs.remove({ filename: user.profile_pic, root: "profile_pic" }, function (
      err,
      gridStore
    ) {
      if (err) return handleError(err);
    });
  }
  user.profile_pic = "none";
  await user.save();
  res.send({ message: "Profile Picture Deleted Successfully" });
});

module.exports = router;
