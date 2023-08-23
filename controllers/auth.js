import express from "express";
import { db } from "../index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authRouter = express.Router();

//REGISTRATION
authRouter.post("/register", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    //CHECK EXISTING USER
    const data = await conn.query(
      "SELECT * FROM users WHERE username = ?",
      req.body.username
    );
    if (data.length)
      return res.status(409).json("ასეთი მომხმარებელი უკვე არსებობს!");

    //Hash the password and create a user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    await conn.query("INSERT INTO users(`username`,`password`) VALUES (?,?)", [
      req.body.username,
      hash,
    ]);
    return res.status(200).json("მომხარებლის სახელი შეიქმნა.");
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

//LOGIN
authRouter.post("/login", async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();
    //CHECK USER
    const data = await conn.query(
      "SELECT * FROM users WHERE username = ?",
      req.body.username
    );
    if (data.length === 0)
      return res.status(400).json("არასწორი მომხმარებელი ან პაროლი!");

    //Check password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).json("არასწორი მომხმარებელი ან პაროლი!");

    const token = jwt.sign({ id: data[0].id }, "jwtkey");
    const { password, ...other } = data[0];

    res.json({ ...other, token: token });
  } catch (error) {
    res.json(error);
  } finally {
    if (conn) return conn.end();
  }
});

/* authRouter.post("/logout", async (req, res) => {
  res
    .clearCookie("access_token", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json("მომხმარებელი გამოვიდა.");
}); */
export default authRouter;
