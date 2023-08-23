import express from "express";
import mysql from "mysql";
import mariadb from "mariadb";
import cors from "cors";
import dotenv from "dotenv";
import blogRouter from "./controllers/blog.js";
import offersRouter from "./controllers/offers.js";
import servicesRouter from "./controllers/services.js";
import subServicesRouter from "./controllers/subServices.js";
import doctorsRouter from "./controllers/doctors.js";
import clinicRouter from "./controllers/clinicData.js";
import subServicesInfoRouter from "./controllers/subServiceInfo.js";
import reserveRouter from "./controllers/reserve.js";
import aboutRouter from "./controllers/about.js";
import authRouter from "./controllers/auth.js";
import cookieParser from "cookie-parser";
import uploadRouter from "./controllers/upload.js";

var whitelist = [
  "http://eyeline.ge",
  "https://eyeline.ge",
  "https://admin.eyeline.ge",
  "http://admin.eyeline.ge",
  "http://localhost:5173",
  "https://eyeline.vercel.app",
  "https://test.eyeline.ge",
];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

//Middleware
const app = express();
app.use(express.json());
app.use(cors()); //corsOptions
//app.use(express.static("uploads"));
app.use("/uploads", express.static("uploads"));
app.use(cookieParser());
//Database connection
export const db = mariadb.createPool({
  charset: "utf8mb4",
  host: "localhost",
  user: "eyelineg_eyelineg",
  password: "B9rXjCFaGtmH",
  database: "eyelineg_eyeline",
});

//Routes
app.use("/api/reserve", reserveRouter);
app.use("/api/doctors", doctorsRouter);
app.use("/api/blog", blogRouter);
app.use("/api/clinicdata", clinicRouter);
app.use("/api/services", servicesRouter);
app.use("/api/subservices", subServicesRouter);
app.use("/api/subservicesinfo", subServicesInfoRouter);
app.use("/api/about", aboutRouter);
app.use("/api/offers", offersRouter);
app.use("/api/auth", authRouter);
app.use("/api/upload", uploadRouter);

//Start server
function start() {
  try {
    app.listen(3000, () => {
      console.log("Server started at port 3000");
    });
  } catch (error) {
    console.log(error);
  }
}

start();
