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
        ref: "AddressV2",
      },
    ],
    preferences: {
      currency: { type: String, default: "USD" },
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
    ref: "UserV2",
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
      ref: "CategoryV2",
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

// Color Schema
const colorSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  hexCode: { type: String, required: true },
  rgbCode: String,
  description: String,
  isActive: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Size Schema
const sizeSchema = new Schema({
  name: { type: String, required: true, index: true },
  slug: { type: String, required: true, index: true },
  category: {
    type: String,
    enum: ["clothing", "shoes", "accessories", "generic"],
    required: true,
    index: true,
  },
  numericValue: Number,
  measurements: {
    chest: Number,
    waist: Number,
    hip: Number,
    length: Number,
    unit: { type: String, default: "cm" },
  },
  isActive: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Material Schema
const materialSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: String,
  composition: [
    {
      material: String,
      percentage: Number,
    },
  ],
  careInstructions: [String],
  properties: {
    waterproof: { type: Boolean, default: false },
    breathable: { type: Boolean, default: false },
    stretchable: { type: Boolean, default: false },
    hypoallergenic: { type: Boolean, default: false },
  },
  isActive: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

// Gender Schema
const genderSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: String,
  targetAge: {
    min: Number,
    max: Number,
  },
  isActive: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Season Schema
const seasonSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: String,
  months: [{ type: Number, min: 1, max: 12 }],
  temperatureRange: {
    min: Number,
    max: Number,
    unit: { type: String, default: "celsius" },
  },
  isActive: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Style Schema
const styleSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: String,
  applicableCategories: [
    {
      type: Schema.Types.ObjectId,
      ref: "CategoryV2",
    },
  ],
  isActive: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Pattern Schema
const patternSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: String,
  patternImage: String,
  isActive: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Shoe Height Schema
const shoeHeightSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: String,
  heightRange: {
    min: Number,
    max: Number,
  },
  applicableCategories: [
    {
      type: Schema.Types.ObjectId,
      ref: "CategoryV2",
    },
  ],
  isActive: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Fit Schema
const fitSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: String,
  applicableCategories: [
    {
      type: Schema.Types.ObjectId,
      ref: "CategoryV2",
    },
  ],
  isActive: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Occasion Schema
const occasionSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: String,
  isActive: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Collar Type Schema
const collarTypeSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: String,
  applicableCategories: [
    {
      type: Schema.Types.ObjectId,
      ref: "CategoryV2",
    },
  ],
  isActive: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, default: 0 },
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

    // Category and Brand
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "CategoryV2",
      required: true,
      index: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "BrandV2",
      index: true,
    },

    // Product Attributes
    genderId: {
      type: Schema.Types.ObjectId,
      ref: "GenderV2",
      index: true,
    },
    seasonId: {
      type: Schema.Types.ObjectId,
      ref: "SeasonV2",
      index: true,
    },
    styleId: {
      type: Schema.Types.ObjectId,
      ref: "StyleV2",
      index: true,
    },
    materialIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "MaterialV2",
      },
    ],
    patternId: {
      type: Schema.Types.ObjectId,
      ref: "PatternV2",
      index: true,
    },
    shoeHeightId: {
      type: Schema.Types.ObjectId,
      ref: "ShoeHeightV2",
      index: true,
    },
    fitId: {
      type: Schema.Types.ObjectId,
      ref: "FitV2",
      index: true,
    },
    occasionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "OccasionV2",
      },
    ],
    collarTypeId: {
      type: Schema.Types.ObjectId,
      ref: "CollarTypeV2",
      index: true,
    },

    // Product Type
    productType: {
      type: String,
      enum: ["simple", "variable", "grouped", "virtual", "downloadable"],
      default: "simple",
      index: true,
    },

    // Pricing
    pricing: {
      basePrice: { type: Number, required: true, index: true },
      salePrice: { type: Number, index: true },
      costPrice: Number,
      currency: { type: String, default: "USD" },
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
        colorId: {
          type: Schema.Types.ObjectId,
          ref: "ColorV2",
        },
        sortOrder: { type: Number, default: 0 },
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

// Product Variant Schema
const productVariantSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "ProductV2",
    required: true,
    index: true,
  },
  sku: { type: String, required: true, unique: true, index: true },

  // Variant attributes
  colorId: {
    type: Schema.Types.ObjectId,
    ref: "ColorV2",
    index: true,
  },
  sizeId: {
    type: Schema.Types.ObjectId,
    ref: "SizeV2",
    index: true,
  },
  genderId: {
    type: Schema.Types.ObjectId,
    ref: "GenderV2",
    index: true,
  },

  // Variant-specific pricing
  pricing: {
    basePrice: Number,
    salePrice: Number,
    costPrice: Number,
  },

  // Variant-specific inventory
  inventory: {
    stockQuantity: { type: Number, default: 0, index: true },
    stockStatus: {
      type: String,
      enum: ["in_stock", "out_of_stock", "backorder"],
      default: "in_stock",
      index: true,
    },
  },

  // Variant-specific images
  images: [
    {
      url: String,
      alt: String,
      isPrimary: { type: Boolean, default: false },
    },
  ],

  isActive: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

// ==================== ORDER SCHEMAS ====================

// Cart Schema
const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserV2",
      index: true,
    },
    sessionId: { type: String, index: true },

    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "ProductV2",
          required: true,
        },
        variantId: {
          type: Schema.Types.ObjectId,
          ref: "ProductVariantV2",
        },
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
      ref: "UserV2",
      index: true,
    },
    customerEmail: { type: String, required: true, index: true },

    // Order items
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "ProductV2",
          required: true,
        },
        variantId: {
          type: Schema.Types.ObjectId,
          ref: "ProductVariantV2",
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
      ref: "ProductV2",
    },
  ],
  applicableCategories: [
    {
      type: Schema.Types.ObjectId,
      ref: "CategoryV2",
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Review Schema
const reviewSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "ProductV2",
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "UserV2",
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
      ref: "OrderV2",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserV2",
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
      default: "USD",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "paypal", "stripe", "bank_transfer"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled", "refunded"],
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
      default: '',
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
      default: '1-7 business days',
    },
    type: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'pickup', 'free'],
      default: 'standard',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    regions: [
      {
        type: String,
        default: 'all',
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
  UserV2: mongoose.model("UserV2", userSchema),
  AddressV2: mongoose.model("AddressV2", addressSchema),

  // Product attribute models
  CategoryV2: mongoose.model("CategoryV2", categorySchema),
  BrandV2: mongoose.model("BrandV2", brandSchema),
  ColorV2: mongoose.model("ColorV2", colorSchema),
  SizeV2: mongoose.model("SizeV2", sizeSchema),
  MaterialV2: mongoose.model("MaterialV2", materialSchema),
  GenderV2: mongoose.model("GenderV2", genderSchema),
  SeasonV2: mongoose.model("SeasonV2", seasonSchema),
  StyleV2: mongoose.model("StyleV2", styleSchema),
  PatternV2: mongoose.model("PatternV2", patternSchema),
  ShoeHeightV2: mongoose.model("ShoeHeightV2", shoeHeightSchema),
  FitV2: mongoose.model("FitV2", fitSchema),
  OccasionV2: mongoose.model("OccasionV2", occasionSchema),
  CollarTypeV2: mongoose.model("CollarTypeV2", collarTypeSchema),

  // Product models
  ProductV2: mongoose.model("ProductV2", productSchema),
  ProductVariantV2: mongoose.model("ProductVariantV2", productVariantSchema),

  // Order models
  CartV2: mongoose.model("CartV2", cartSchema),
  OrderV2: mongoose.model("OrderV2", orderSchema),
  PaymentV2: mongoose.model("PaymentV2", paymentSchema),
  DeliveryOptionV2: mongoose.model("DeliveryOptionV2", deliveryOptionSchema),

  // Additional models
  CouponV2: mongoose.model("CouponV2", couponSchema),
  ReviewV2: mongoose.model("ReviewV2", reviewSchema),
};

