const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const subcategoryRoutes = require("./routes/subcategory.routes");
const cartRoutes = require("./routes/cart.routes");
const deliveryRoutes = require("./routes/delivery.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const addressRoutes = require("./routes/address.routes");
const brandRoutes = require("./routes/brand.routes");
const filterRoutes = require("./routes/filter.routes");
const filterGroupRoutes = require("./routes/filterGroup.routes");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const mergedSwaggerDocument = {
  ...swaggerDocument,
  paths: {
    ...swaggerDocument.paths,
  },
  components: {
    ...swaggerDocument.components,
  },
  tags: [...swaggerDocument.tags],
};
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3043", // Development
      "http://localhost:3000", // Development
      "https://dev-rapid-ideation-management-hzduckfpfffff6hr.canadacentral-01.azurewebsites.net", // Azure Dev
      "http://dev-rapid-ideation-management-hzduckfpfffff6hr.canadacentral-01.azurewebsites.net", // Azure Dev (HTTP)
      "https://rapid-ideation-management-hzduckfpfffff6hr.canadacentral-01.azurewebsites.net", // Azure Prod
      "http://rapid-ideation-management-hzduckfpfffff6hr.canadacentral-01.azurewebsites.net",
      "https://dev-rapid-frontend-bzeyhbgeejebaegv.canadacentral-01.azurewebsites.net",
      "http://dev-rapid-frontend-bzeyhbgeejebaegv.canadacentral-01.azurewebsites.net",
      "https://demo-rapid-fe-h2e4c2gmhbbxb9az.canadacentral-01.azurewebsites.net",
      "http://demo-rapid-fe-h2e4c2gmhbbxb9az.canadacentral-01.azurewebsites.net",
      "https://rapid-frontend-bzeyhbgeejebaegv.canadacentral-01.azurewebsites.net",
      "http://rapid-frontend-bzeyhbgeejebaegv.canadacentral-01.azurewebsites.net",
      "https://dev-rapid-fe-fffucwf7grdfgbas.canadacentral-01.azurewebsites.net",
      "http://dev-rapid-fe-fffucwf7grdfgbas.canadacentral-01.azurewebsites.net",
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).json({
    body: `(${process.env.NODE_ENV}) Ecoomerce server is Running....`,
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(mergedSwaggerDocument, {
    explorer: true,
    customCssUrl:
      "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-classic.css",
  })
);

//V1 APIs
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/brand", brandRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/subcategories", subcategoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/delivery", deliveryRoutes);
app.use("/api/v1/filter", filterRoutes);
app.use("/api/v1/filtergroup", filterGroupRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);

module.exports = app;
