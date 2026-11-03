//Routes
const authRoute = require("./authRoute");
const categoryRoute = require("./categoryRoute");
const productRoute = require("./productRoute");
const tableRoute = require("./tableRoute");
const orderRoute = require("./orderRoute");
const dashboardRoute = require("./dashboardRoute");
const reportRoute = require("./reportRoute");
const mountRoutes = (app) => {
  //Mount Routes
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/categories", categoryRoute);
  app.use("/api/v1/products", productRoute);
  app.use("/api/v1/tables", tableRoute);
  app.use("/api/v1/orders", orderRoute);
  app.use("/api/v1/dashboard", dashboardRoute);
  app.use("/api/v1/reports", reportRoute);
};
module.exports = mountRoutes;
