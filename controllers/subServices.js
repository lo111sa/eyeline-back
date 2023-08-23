import express from "express";
import { db } from "../index.js";
import multer from "multer";
import {
  addImages,
  checkImg,
  deleteFiles,
  deleteSingleImage,
} from "../utils/functions.js";
const storage = addImages("subServices");
const upload = multer({ storage: storage });

const subServicesRouter = express.Router();

// get route
subServicesRouter.get("/:id", async (req, res) => {
  let conn;
  let result;
  try {
    conn = await db.getConnection();
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    const numRows = await conn.query(
      `SELECT count(*) as count  FROM subServices where serviceId=?`,
      req.params.id
    );
    const pageCount = Math.ceil(parseInt(numRows[0].count) / limit);

    if (Object.keys(req.query).length) {
      result = await conn.query(
        `SELECT * FROM subServices WHERE serviceId=? ORDER BY date desc LIMIT ? OFFSET ?`,
        [req.params.id, +limit, +skip]
      );
      res.json({ data: result, pageCount });
    } else {
      result = await conn.query(
        `SELECT * FROM subServices WHERE serviceId=? ORDER BY date desc`,
        [req.params.id]
      );
      res.json({ data: result });
    }
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// add subServices
subServicesRouter.post("/", async (req, res) => {
  let conn;
  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();
    const result = await conn.query(
      "INSERT INTO subServices (`title`,`description`,`img`,`serviceId`) VALUES (?,?,?,?)",
      [req.body.title, req.body.description, req.body.image, req.body.serviceId]
    );
    return res.json({
      id: parseInt(result.insertId),
      ...req.body,
      message: "პოსტი დამატებულია",
    });
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// Update sub service
subServicesRouter.put("/:id", async (req, res) => {
  let conn;

  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();

    const oldImg = await conn.query(
      "SELECT img FROM subServices WHERE id=?",
      req.params.id
    );

    if (oldImg[0].img !== req.body.image && req.body.image !== "") {
      deleteSingleImage(oldImg);
    }

    await conn.query(
      "UPDATE subServices SET `title`= ?,`description`=?,`img`=?, `serviceId`=? WHERE id = ?",
      [
        req.body.title,
        req.body.description,
        req.body.image,
        req.body.serviceId,
        req.params.id,
      ]
    );
    return res.json({ message: "სერვისი განახლებულია" });
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// delete subservice
subServicesRouter.delete("/:id", async (req, res) => {
  let conn;
  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();
    const result = await conn.query(
      "SELECT img FROM subServices WHERE id = ?",
      req.params.id
    );
    const result1 = await conn.query(
      "SELECT img FROM subServiceInfo WHERE subserviceId = ?",
      req.params.id
    );

    const allImages = [...result, ...result1];
    deleteFiles(allImages);

    await conn.query(`DELETE FROM subServices WHERE id=?`, req.params.id);
    res.json("ჩანაწერი წაიშალა");
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

export default subServicesRouter;

/* */
