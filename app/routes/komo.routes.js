import express from "express";
import { moko, controllers } from "../controllers/komo.controllers.js";

const komo = express.Router();

komo.get("/", moko);
komo.put("/", controllers);

export default komo;
