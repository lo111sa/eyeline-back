import express from "express";
import { db } from "../index.js";
import { deleteFiles } from "../utils/functions.js";

const servicesRouter = express.Router();

// get route
servicesRouter.get("/", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const result = await conn.query(`SELECT * FROM services`);
    res.json(result);
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// get data by id
servicesRouter.get("/:id", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const result = await conn.query(
      "SELECT * FROM services WHERE id=?",
      req.params.id
    );

    return res.json(result);
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// add service
servicesRouter.post("/", async (req, res) => {
  let conn;
  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();
    const result = await conn.query(
      "INSERT INTO services (`title`) VALUES (?)",
      [req.body.title]
    );

    return res.json({
      id: parseInt(result.insertId),
      ...req.body,
      message: "სერვისი დამატებულია",
    });
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// Update servise
servicesRouter.put("/:id", async (req, res) => {
  let conn;

  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();

    await conn.query("UPDATE services SET `title`=? WHERE id = ?", [
      req.body.title,
      req.params.id,
    ]);

    return res.json({ message: "სერვისი განახლებულია" });
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// delete service
servicesRouter.delete("/:id", async (req, res) => {
  let conn;
  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();
    const result = await conn.query(
      "SELECT img FROM subServices WHERE serviceId = ?",
      req.params.id
    );
    const result1 = await conn.query(
      "SELECT img FROM subServiceInfo WHERE serviceId = ?",
      req.params.id
    );

    const allImages = [...result, ...result1];
    deleteFiles(allImages);

    await conn.query(`DELETE FROM services WHERE id=?`, req.params.id);
    res.json("ჩანაწერი წაიშალა");
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

export default servicesRouter;
