import express from "express";
import personRoute from "./route/person";

const app = express();

app.use("/api/person", personRoute)

app.listen(8000)
