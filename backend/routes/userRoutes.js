const express = require("express");
const {
  registerUser,
  loginUser,
  allUsers,
} = require("../contorllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

var upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      console.log("png, jpg supported.");
      cb(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});

const router = express.Router();

router.post("/sign-up", upload.single("pic"), registerUser);
router.post("/sign-in", loginUser);
router.route("/").get(protect, allUsers);

module.exports = router;
