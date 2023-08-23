import express from "express";
import { db } from "../index.js";
import fs from "fs";
import multer from "multer";
import { addImages, checkImg, deleteSingleImage } from "../utils/functions.js";
const storage = addImages("about");
const upload = multer({ storage: storage });

const aboutRouter = express.Router();

// get route
aboutRouter.get("/", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const rows = await conn.query(`SELECT * FROM about`);
    res.json(rows);
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// add about info
aboutRouter.post("/", async (req, res) => {
  let conn;
  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();
    await conn.query(
      "INSERT INTO about (`title`,`maintxt`,`description`,`img`) VALUES (?,?,?,?)",
      [req.body.title, req.body.maintxt, req.body.description, req.body.image]
    );
    res.json({ message: "წარმატებით დაემატა" });
  } catch (error) {
    res.json(error.message);
  } finally {
    if (conn) return conn.end();
  }
});

// Update post
aboutRouter.put("/:id", async (req, res) => {
  let conn;

  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();

    const oldImg = await conn.query(
      "SELECT img FROM about WHERE id=?",
      req.params.id
    );

    if (oldImg[0].img !== req.body.image && req.body.image !== "") {
      deleteSingleImage(oldImg);
    }

    await conn.query(
      "UPDATE about SET `title`=?,`maintxt`=?,`description`=?,`img`=? WHERE id = ?",
      [
        req.body.title,
        req.body.maintxt,
        req.body.description,
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

// delete about info
aboutRouter.delete("/:id", async (req, res) => {
  let conn;
  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();
    const result = await conn.query(
      "SELECT img FROM about WHERE id=?",
      req.params.id
    );
    deleteSingleImage(result);
    await conn.query(`DELETE FROM about WHERE id=?`, req.params.id);
    res.json("ჩანაწერი წაიშალა");
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

export default aboutRouter;
