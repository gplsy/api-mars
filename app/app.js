import express from "express";
import komo from "./routes/komo.routes.js";

const app = express();

app.use(express.json());

app.use("/api", komo);

export default app;
