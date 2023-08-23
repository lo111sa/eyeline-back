import express from "express";
import { db } from "../index.js";

const reserveRouter = express.Router();

// get route
reserveRouter.get("/", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();

    const { page, limit } = req.query;
    const skip = (page - 1) * limit;

    const numRows = await conn.query(`SELECT count(*) as count  FROM blog`);
    const pageCount = Math.ceil(parseInt(numRows[0].count) / limit);
    const result = await conn.query(
      `SELECT * FROM reserve ORDER BY date desc LIMIT ? OFFSET ?`,
      [+limit, +skip]
    );
    res.json({ data: result, pageCount });
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// add service
reserveRouter.post("/", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const { name, phone, service, reserveDate, reserveHour, info } = req.body;
    const result = await conn.query(
      "INSERT INTO reserve (`name`, `phone`,`service`,`reserveDate`,`reserveHour`,info) VALUES (?,?,?,?,?,?)",
      [name, phone, service, reserveDate, reserveHour, info]
    );
    return res.json("თქვენი მონაცემები წარმატებით გაიგზავნა");
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// delete reserve
reserveRouter.delete("/:id", async (req, res) => {
  let conn;
  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();
    await conn.query(`DELETE FROM reserve WHERE id=?`, req.params.id);
    res.json("ჩანაწერი წაიშალა");
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

export default reserveRouter;
