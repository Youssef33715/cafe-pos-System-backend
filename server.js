const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const dbConnection = require("./config/database");
const ApiError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");

dotenv.config({ path: "config.env" });
//Routes
const mountRoutes = require("./routes/index");

//connect with db
dbConnection();

//express app
const app = express();

//Middlewares
app.use(
  cors({
    origin: [
      "https://boda-cafe-pos-system.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);

// هيدر مهم جداً عشان المتصفحات الحديثة تسمح بالوصول للشبكة المحلية
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

app.use(express.json());
app.use("/uploads", express.static("uploads"));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode:${process.env.NODE_ENV}`);
}

app.get("/", (req, res) => {
  res.json({ message: "Pos System Cafe API is running" });
});
// Mount all routes
mountRoutes(app);

// Global error handling middleware
app.use(globalError);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
