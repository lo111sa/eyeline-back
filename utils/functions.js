import multer from "multer";
import path from "path";
import fs from "fs";

// add images
export function addImages(routeName) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `uploads/${routeName}`);
    },
    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname + "_" + Date.now() + path.extname(file.originalname)
      );
    },
  });

  return storage;
}

//Check if image exists in req
export function checkImg(req) {
  let img = "";
  if (req.file)
    img =
      req.file.destination.slice(7, req.file.destination.length) +
      "/" +
      req.file.filename;

  return img;
}

//Delete single image
export function deleteSingleImage(list) {
  if (list[0].img !== "")
    fs.existsSync(`uploads${list[0].img}`) &&
      fs.unlinkSync(`uploads${list[0].img}`);
}

//Function for delete multiple files
export const deleteFiles = async (data) => {
  try {
    data.forEach((item) => {
      fs.existsSync(`uploads${item.img}`) &&
        fs.unlinkSync(`uploads${item.img}`);
    });
  } catch (error) {}
};
