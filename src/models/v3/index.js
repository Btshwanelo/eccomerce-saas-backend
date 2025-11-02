const mongoose = require("mongoose");
const { Schema } = mongoose;

// ==================== USER SCHEMAS ====================

// User Schema (handles both registered and guest users)
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      firstName: String,
      lastName: String,
      phone: String,
      dateOfBirth: Date,
      avatar: String,
    },
    addresses: [
      {
        type: Schema.Types.ObjectId,
        ref: "AddressV3",
      },
    ],
    preferences: {
      currency: { type: String, default: "R" },
      language: { type: String, default: "en" },
      newsletter: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },
    lastLogin: Date,
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Address Schema
const addressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "UserV3",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["billing", "shipping", "both"],
    default: "both",
    index: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: String,
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true, index: true },
  state: { type: String, required: true, index: true },
  postalCode: { type: String, required: true, index: true },
  country: { type: String, required: true, index: true },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// ==================== PRODUCT ATTRIBUTE SCHEMAS ====================

// Category Schema (hierarchical structure)
const categorySchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    image: String,
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "CategoryV3",
      default: null,
      index: true,
    },
    level: { type: Number, default: 0, index: true },
    path: { type: String, index: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Brand Schema
const brandSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: String,
  logo: String,
  website: String,
  countryOrigin: String,
  isActive: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

// ==================== PRODUCT SCHEMAS ====================

// Product Schema
const productSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    shortDescription: String,
    sku: { type: String, required: true, unique: true, index: true },

    sizes: [
      {
        name: String,
        stockQuantity: Number,
        stockStatus: {
          type: String,
          enum: ["in_stock", "out_of_stock", "backorder"],
          default: "in_stock",
        },
      },
    ],
    // Category and Brand
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "CategoryV3",
      required: true,
      index: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "BrandV3",
      index: true,
    },

    // Product Attributes
    gender: { type: String, enum: ["male", "female", "unisex"] },

    // Pricing
    pricing: {
      basePrice: { type: Number, required: true, index: true },
      salePrice: { type: Number, index: true },
      costPrice: Number,
      currency: { type: String, default: "R" },
    },

    // Inventory (for simple products)
    inventory: {
      trackInventory: { type: Boolean, default: true },
      stockQuantity: { type: Number, default: 0, index: true },
      stockStatus: {
        type: String,
        enum: ["in_stock", "out_of_stock", "backorder"],
        default: "in_stock",
        index: true,
      },
      lowStockThreshold: { type: Number, default: 5 },
      allowBackorders: { type: Boolean, default: false },
    },

    // Physical attributes
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
      unit: { type: String, default: "cm" },
    },

    // Media
    images: [
      {
        url: { type: String, required: true },
        alt: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],

    // SEO
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },

    // Status and visibility
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "hidden"],
      default: "public",
      index: true,
    },

    // Analytics
    views: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0, index: true },
    rating: {
      average: { type: Number, default: 0, index: true },
      count: { type: Number, default: 0 },
    },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// ==================== ORDER SCHEMAS ====================

// Cart Schema
const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserV3",
      index: true,
    },
    sessionId: { type: String, index: true },

    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "ProductV3",
          required: true,
        },
        size: { type: String },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    totals: {
      subtotal: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      shippingAmount: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    appliedCoupons: [
      {
        code: String,
        discountAmount: Number,
      },
    ],

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Order Schema
const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Customer information
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserV3",
      index: true,
    },
    customerEmail: { type: String, required: true, index: true },

    // Order items
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "ProductV3",
          required: true,
        },
        variantId: {
          type: Schema.Types.ObjectId,
          ref: "ProductVariantV3",
        },
        productName: { type: String, required: true },
        variantName: String,
        sku: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],

    // Addresses
    billingAddress: {
      firstName: String,
      lastName: String,
      company: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },

    shippingAddress: {
      firstName: String,
      lastName: String,
      company: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },

    // Order totals
    totals: {
      subtotal: { type: Number, required: true },
      taxAmount: { type: Number, default: 0 },
      shippingAmount: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },

    // Order status
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },

    // Payment information
    payment: {
      method: String,
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
        index: true,
      },
      transactionId: String,
      paidAt: Date,
    },

    // Shipping information
    shipping: {
      method: String,
      carrier: String,
      trackingNumber: String,
      shippedAt: Date,
      estimatedDelivery: Date,
    },

    notes: String,

    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// ==================== ADDITIONAL SCHEMAS ====================

// Coupon Schema
const couponSchema = new Schema({
  code: { type: String, required: true, unique: true, index: true },
  description: String,
  type: {
    type: String,
    enum: ["percentage", "fixed_amount", "free_shipping"],
    required: true,
  },
  value: { type: Number, required: true },
  minimumAmount: Number,
  maximumDiscount: Number,
  usageLimit: Number,
  usageCount: { type: Number, default: 0 },
  userUsageLimit: Number,
  isActive: { type: Boolean, default: true, index: true },
  startsAt: Date,
  expiresAt: { type: Date, index: true },
  applicableProducts: [
    {
      type: Schema.Types.ObjectId,
      ref: "ProductV3",
    },
  ],
  applicableCategories: [
    {
      type: Schema.Types.ObjectId,
      ref: "CategoryV3",
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Review Schema
const reviewSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "ProductV3",
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "UserV3",
    required: true,
    index: true,
  },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true,
  },
  title: String,
  content: { type: String, required: true },

  isVerifiedPurchase: { type: Boolean, default: false, index: true },
  isApproved: { type: Boolean, default: false, index: true },

  helpfulVotes: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now, index: true },
});

// ==================== PAYMENT SCHEMA ====================

const paymentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "OrderV3",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserV3",
      default: null,
    },
    guestId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "R",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "paypal", "stripe", "payfast"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
    },
    transactionId: {
      type: String,
      default: null,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: null,
    },
    refunds: [
      {
        amount: Number,
        reason: String,
        processedAt: { type: Date, default: Date.now },
        gatewayRefundId: String,
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// ==================== DELIVERY OPTIONS SCHEMA ====================

const deliveryOptionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    cost: {
      type: Number,
      required: true,
      default: 0,
    },
    estimatedDays: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 7 },
    },
    estimatedDeliveryTime: {
      type: String,
      default: "1-7 business days",
    },
    type: {
      type: String,
      enum: ["standard", "express", "overnight", "pickup", "free"],
      default: "standard",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    regions: [
      {
        type: String,
        default: "all",
      },
    ],
    weightLimit: {
      type: Number,
      default: null, // null means no limit
    },
    freeShippingThreshold: {
      type: Number,
      default: null, // null means no free shipping
    },
    trackingSupported: {
      type: Boolean,
      default: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  // User models
  UserV3: mongoose.model("UserV3", userSchema),
  AddressV3: mongoose.model("AddressV3", addressSchema),

  // Product attribute models
  CategoryV3: mongoose.model("CategoryV3", categorySchema),
  BrandV3: mongoose.model("BrandV3", brandSchema),

  // Product models
  ProductV3: mongoose.model("ProductV3", productSchema),

  // Order models
  CartV3: mongoose.model("CartV3", cartSchema),
  OrderV3: mongoose.model("OrderV3", orderSchema),
  PaymentV3: mongoose.model("PaymentV3", paymentSchema),
  DeliveryOptionV3: mongoose.model("DeliveryOptionV3", deliveryOptionSchema),

  // Additional models
  CouponV3: mongoose.model("CouponV3", couponSchema),
  ReviewV3: mongoose.model("ReviewV3", reviewSchema),
};
