import express from "express";
import personRoute from "./route/person";
import memberRoute from "./route/member";
import goodsRoute from "./route/goods";
import placementRoute from "./route/placement";
import borrowRoute from "./route/borrow";
import searchRoute from "./route/search";
import historyRoute from "./route/history";
const app = express();

app.use("/api/person", personRoute)
app.use("/api/member", memberRoute)
app.use("/api/goods", goodsRoute)
app.use("/api/placement", placementRoute)
app.use("/api/borrow", borrowRoute)
app.use("/api/search", searchRoute)
app.use("/api/history", historyRoute)

app.listen(8000)
