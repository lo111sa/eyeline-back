import express from "express";
import { db } from "../index.js";

const clinicRouter = express.Router();

// get route
clinicRouter.get("/", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    const result = await conn.query(`SELECT * FROM clinicData`);
    res.json(...result);
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

// add clinic info
clinicRouter.put("/", async (req, res) => {
  let conn;
  try {
    const token = req.headers.authorization;
    if (!token) return res.json("თქვენ არ ხართ ავტორიზირებული");

    conn = await db.getConnection();
    const { phone, email, address, workinghours } = req.body;

    await conn.query(
      "UPDATE clinicData SET phone = ?, email = ?, address = ?, workinghours=? WHERE id = 1",
      [phone, email, address, workinghours]
    );
    return res.json({ message: "ინფორმაცია შეინახა" });
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

export default clinicRouter;
