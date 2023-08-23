import express from "express";
import { db } from "../index.js";
import fs from "fs";
import multer from "multer";
import { addImages, checkImg, deleteSingleImage } from "../utils/functions.js";
const storage = addImages("blog");
const upload = multer({ storage: storage });

const blogRouter = express.Router();

// get route
blogRouter.get("/", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();

    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const numRows = await conn.query(`SELECT count(*) as count  FROM blog`);
    const pageCount = Math.ceil(parseInt(numRows[0].count) / limit);
    const result = await conn.query(
      `SELECT * FROM blog ORDER BY date desc LIMIT ? OFFSET ?`,
      [+limit, +skip]
    );
    res.json({ data: result, pageCount });
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// get data by id
blogRouter.get("/:id", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const result = await conn.query(
      "SELECT * FROM blog WHERE id=?",
      req.params.id
    );
    res.json(result);
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// add blog
blogRouter.post("/", async (req, res) => {
  let conn;

  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    // const img = checkImg(req);
    conn = await db.getConnection();
    await conn.query(
      "INSERT INTO blog (`title`,`description`,`img`) VALUES (?,?,?)",
      [req.body.title, req.body.description, req.body.image]
    );
    return res.json({ message: "პოსტი დამატებულია" });
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// Update post
blogRouter.put("/:id", async (req, res) => {
  let conn;

  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();

    const oldImg = await conn.query(
      "SELECT img FROM blog WHERE id=?",
      req.params.id
    );

    if (oldImg[0].img !== req.body.image && req.body.image !== "") {
      deleteSingleImage(oldImg);
    }

    await conn.query(
      "UPDATE blog SET `title`= ?,`description`=?,`img`=? WHERE id = ?",
      [req.body.title, req.body.description, req.body.image, req.params.id]
    );
    return res.json({ message: "პოსტი განახლებულია" });
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// delete blog
blogRouter.delete("/:id", async (req, res) => {
  let conn;
  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();
    const result = await conn.query(
      "SELECT img FROM blog WHERE id=?",
      req.params.id
    );
    deleteSingleImage(result);
    await conn.query(`DELETE FROM blog WHERE id=?`, req.params.id);
    res.json("ჩანაწერი წაიშალა");
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

export default blogRouter;
