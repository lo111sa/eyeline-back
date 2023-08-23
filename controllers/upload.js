import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { addImages } from "../utils/functions.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `uploads/${req.params.folder}`);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

const uploadRouter = express.Router();

// upload image
uploadRouter.post("/:folder", upload.single("image"), async (req, res) => {
  const file = req.file;
  res.status(200).json("/" + req.params.folder + "/" + file.filename);
});

export default uploadRouter;
