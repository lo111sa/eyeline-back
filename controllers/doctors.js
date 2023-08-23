import express from "express";
import { db } from "../index.js";
import { addImages, checkImg, deleteSingleImage } from "../utils/functions.js";
import multer from "multer";
const storage = addImages("doctors");
const upload = multer({ storage: storage });

const doctorsRouter = express.Router();

// get doctors list
doctorsRouter.get("/", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    const numRows = await conn.query(`SELECT count(*) as count  FROM doctors`);
    const pageCount = Math.ceil(parseInt(numRows[0].count) / limit);
    const result = await conn.query(
      `SELECT * FROM doctors ORDER BY date desc LIMIT ? OFFSET ?`,
      [+limit, +skip]
    );
    res.json({ data: result, pageCount });
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// get doctor by id
doctorsRouter.get("/:id", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const result = await conn.query(
      "SELECT * FROM doctors WHERE id=?",
      req.params.id
    );
    res.json(result);
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// add doctor
doctorsRouter.post("/", async (req, res) => {
  let conn;
  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");
    conn = await db.getConnection();
    await conn.query(
      "INSERT INTO doctors (`name`,`lastName`,`specialty`,`jobExperience`,`education`,`email`,`phone`,`additionalinformation`,`img`) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        req.body.name,
        req.body.lastName,
        req.body.specialty,
        req.body.jobExperience,
        req.body.education,
        req.body.email,
        req.body.phone,
        "",
        req.body.image,
      ]
    );
    return res.json({ message: "პოსტი დამატებულია" });
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// Update doctor
doctorsRouter.put("/:id", async (req, res) => {
  let conn;

  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();

    const oldImg = await conn.query(
      "SELECT img FROM doctors WHERE id=?",
      req.params.id
    );
    if (oldImg[0].img !== req.body.image && req.body.image !== "") {
      deleteSingleImage(oldImg);
    }

    await conn.query(
      "UPDATE doctors SET `name`=?,`lastName`=?,`specialty`=?,`jobExperience`=?,`education`=?,`email`=?,`phone`=?,`additionalinformation`=?,`img`=? WHERE id = ?",
      [
        req.body.name,
        req.body.lastName,
        req.body.specialty,
        req.body.jobExperience,
        req.body.education,
        req.body.email,
        req.body.phone,
        "",
        req.body.image,
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

// delete doctor
doctorsRouter.delete("/:id", async (req, res) => {
  let conn;
  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();
    const result = await conn.query(
      "SELECT img FROM doctors WHERE id=?",
      req.params.id
    );
    deleteSingleImage(result);
    await conn.query(`DELETE FROM doctors WHERE id=?`, req.params.id);
    res.json("ჩანაწერი წაიშალა");
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

export default doctorsRouter;
