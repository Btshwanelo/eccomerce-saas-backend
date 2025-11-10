const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
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
const analyticsRoutes = require("./routes/analytics.routes");

// V2 Routes
const v2ProductRoutes = require("./routes/v2/product.routes");
const v2CategoryRoutes = require("./routes/v2/category.routes");
const v2BrandRoutes = require("./routes/v2/brand.routes");
const v2AttributeRoutes = require("./routes/v2/attribute.routes");
const v2UserRoutes = require("./routes/v2/user.routes");
const v2CartRoutes = require("./routes/v2/cart.routes");
const v2OrderRoutes = require("./routes/v2/order.routes");
const v2AddressRoutes = require("./routes/v2/address.routes");
const v2DeliveryRoutes = require("./routes/v2/delivery.routes");

// V3 Routes
const v3ProductRoutes = require("./routes/v3/product.routes");
const v3CategoryRoutes = require("./routes/v3/category.routes");
const v3BrandRoutes = require("./routes/v3/brand.routes");
const v3UserRoutes = require("./routes/v3/user.routes");
const v3CartRoutes = require("./routes/v3/cart.routes");
const v3OrderRoutes = require("./routes/v3/order.routes");
const v3AddressRoutes = require("./routes/v3/address.routes");
const v3DeliveryRoutes = require("./routes/v3/delivery.routes");

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
      "http://localhost:3001", // Development
      "http://localhost:3002", // Development
      "http://localhost:3003", // Development
      "http://localhost:3004", // Development
      "http://localhost:3005", // Development
      "http://109.199.122.35:3000",
      "http://109.199.122.35:3002", // External frontend access
      "http://109.199.122.35:5000", // Additional frontend port
      "https://www.gencreps.co.za",
      "https://gencreps.co.za",
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow all localhost ports in development (3000-3010)
    if (
      origin.startsWith("http://localhost:") &&
      process.env.NODE_ENV !== "production"
    ) {
      const port = origin.split(":")[2];
      const portNumber = parseInt(port);
      if (portNumber >= 3000 && portNumber <= 3010) {
        return callback(null, true);
      }
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-session-id",
    "x-guest-id",
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // Cache preflight requests for 24 hours
};

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
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/subcategories", subcategoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/delivery", deliveryRoutes);
app.use("/api/v1/filter", filterRoutes);
app.use("/api/v1/filtergroup", filterGroupRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

//V2 APIs
app.use("/api/v2/products", v2ProductRoutes);
app.use("/api/v2/categories", v2CategoryRoutes);
app.use("/api/v2/brands", v2BrandRoutes);
app.use("/api/v2/attributes", v2AttributeRoutes);
app.use("/api/v2/users", v2UserRoutes);
app.use("/api/v2/cart", v2CartRoutes);
app.use("/api/v2/orders", v2OrderRoutes);
app.use("/api/v2/addresses", v2AddressRoutes);
app.use("/api/v2/delivery", v2DeliveryRoutes);

//V3 APIs
app.use("/api/v3/products", v3ProductRoutes);
app.use("/api/v3/categories", v3CategoryRoutes);
app.use("/api/v3/brands", v3BrandRoutes);
app.use("/api/v3/users", v3UserRoutes);
app.use("/api/v3/cart", v3CartRoutes);
app.use("/api/v3/orders", v3OrderRoutes);
app.use("/api/v3/addresses", v3AddressRoutes);
app.use("/api/v3/delivery", v3DeliveryRoutes);

module.exports = app;
