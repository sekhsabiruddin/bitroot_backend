const express = require("express");
const app = express();
const dbConnect = require("./db/db");
const contact = require("./controllers/contact");
const errorMiddleware = require("./middleware/error");
dbConnect();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static("uploads"));

app.use("/api", contact);
//Error Handler Middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
