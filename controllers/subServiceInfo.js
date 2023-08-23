import express from "express";
import { db } from "../index.js";
import multer from "multer";
import { addImages, checkImg, deleteSingleImage } from "../utils/functions.js";
const storage = addImages("subServiceInfo");
const upload = multer({ storage: storage });

const subServicesInfoRouter = express.Router();

// get data by id
subServicesInfoRouter.get("/:id", async (req, res) => {
  let conn;
  let result;
  try {
    conn = await db.getConnection();
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    const numRows = await conn.query(
      `SELECT count(*) as count  FROM subServiceInfo where subserviceId=?`,
      req.params.id
    );
    const pageCount = Math.ceil(parseInt(numRows[0].count) / limit);

    if (Object.keys(req.query).length) {
      result = await conn.query(
        `SELECT * FROM subServiceInfo WHERE subserviceId=? ORDER BY date desc LIMIT ? OFFSET ?`,
        [req.params.id, +limit, +skip]
      );
      res.json({ data: result, pageCount });
    } else {
      result = await conn.query(
        `SELECT * FROM subServiceInfo WHERE subserviceId=? ORDER BY date desc`,
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
subServicesInfoRouter.post("/", async (req, res) => {
  let conn;
  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();
    const result = await conn.query(
      "INSERT INTO subServiceInfo (`title`,`maintxt`,`description`,`img`,`subserviceId`, `serviceId`,`bigimg`) VALUES (?,?,?,?,?,?,?)",
      [
        req.body.title,
        req.body.maintxt,
        req.body.description,
        req.body.image,
        req.body.subserviceId,
        req.body.serviceId,
        req.body.bigimg,
      ]
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

// Update post
subServicesInfoRouter.put("/:id", async (req, res) => {
  let conn;

  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();

    const oldImg = await conn.query(
      "SELECT img FROM subServiceInfo WHERE id=?",
      req.params.id
    );

    if (oldImg[0].img !== req.body.image && req.body.image !== "") {
      deleteSingleImage(oldImg);
    }

    await conn.query(
      "UPDATE subServiceInfo SET `title`=?,`maintxt`=?,`description`=?,`img`=?,`subserviceId`=?, `serviceId`=?,`bigimg`=? WHERE id = ?",
      [
        req.body.title,
        req.body.maintxt,
        req.body.description,
        req.body.image,
        req.body.subserviceId,
        req.body.serviceId,
        req.body.bigimg,
        req.params.id,
      ]
    );
    return res.json({ message: "პოსტი განახლებულია" });
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// delete subserviceinfo
subServicesInfoRouter.delete("/:id", async (req, res) => {
  let conn;
  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();
    const result = await conn.query(
      "SELECT img FROM subServiceInfo WHERE id=?",
      req.params.id
    );
    deleteSingleImage(result);
    await conn.query(`DELETE FROM subServiceInfo WHERE id=?`, req.params.id);
    res.json("ჩანაწერი წაიშალა");
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

export default subServicesInfoRouter;
