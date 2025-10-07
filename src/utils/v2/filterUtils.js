const {
  ProductV2,
  CategoryV2,
  BrandV2,
  ColorV2,
  SizeV2,
  MaterialV2,
  GenderV2,
  SeasonV2,
  StyleV2,
  PatternV2,
  ShoeHeightV2,
  FitV2,
  OccasionV2,
  CollarTypeV2,
} = require("../../models/v2");

/**
 * Build advanced product filter query
 * @param {Object} queryParams - Query parameters from request
 * @returns {Object} MongoDB filter object
 */
function buildAdvancedProductFilter(queryParams) {
  const filter = {};

  // Basic filters
  if (queryParams.categoryId) filter.categoryId = queryParams.categoryId;
  if (queryParams.brandId) filter.brandId = queryParams.brandId;
  if (queryParams.genderId) filter.genderId = queryParams.genderId;
  if (queryParams.seasonId) filter.seasonId = queryParams.seasonId;
  if (queryParams.styleId) filter.styleId = queryParams.styleId;
  if (queryParams.patternId) filter.patternId = queryParams.patternId;
  if (queryParams.shoeHeightId) filter.shoeHeightId = queryParams.shoeHeightId;
  if (queryParams.fitId) filter.fitId = queryParams.fitId;
  if (queryParams.collarTypeId) filter.collarTypeId = queryParams.collarTypeId;

  // Array filters
  if (queryParams.materialIds) {
    filter.materialIds = { $in: Array.isArray(queryParams.materialIds) ? queryParams.materialIds : [queryParams.materialIds] };
  }
  if (queryParams.occasionIds) {
    filter.occasionIds = { $in: Array.isArray(queryParams.occasionIds) ? queryParams.occasionIds : [queryParams.occasionIds] };
  }

  // Price range
  if (queryParams.minPrice || queryParams.maxPrice) {
    filter["pricing.basePrice"] = {};
    if (queryParams.minPrice) filter["pricing.basePrice"].$gte = Number(queryParams.minPrice);
    if (queryParams.maxPrice) filter["pricing.basePrice"].$lte = Number(queryParams.maxPrice);
  }

  // Sale price range
  if (queryParams.minSalePrice || queryParams.maxSalePrice) {
    filter["pricing.salePrice"] = {};
    if (queryParams.minSalePrice) filter["pricing.salePrice"].$gte = Number(queryParams.minSalePrice);
    if (queryParams.maxSalePrice) filter["pricing.salePrice"].$lte = Number(queryParams.maxSalePrice);
  }

  // Stock status
  if (queryParams.stockStatus) {
    filter["inventory.stockStatus"] = queryParams.stockStatus;
  }

  // Stock quantity
  if (queryParams.minStock || queryParams.maxStock) {
    filter["inventory.stockQuantity"] = {};
    if (queryParams.minStock) filter["inventory.stockQuantity"].$gte = Number(queryParams.minStock);
    if (queryParams.maxStock) filter["inventory.stockQuantity"].$lte = Number(queryParams.maxStock);
  }

  // Product type
  if (queryParams.productType) filter.productType = queryParams.productType;

  // Status and visibility
  filter.status = queryParams.status || "published";
  filter.visibility = queryParams.visibility || "public";

  // Rating filter
  if (queryParams.minRating) {
    filter["rating.average"] = { $gte: Number(queryParams.minRating) };
  }

  // Sales count filter
  if (queryParams.minSales) {
    filter.salesCount = { $gte: Number(queryParams.minSales) };
  }

  // Views filter
  if (queryParams.minViews) {
    filter.views = { $gte: Number(queryParams.minViews) };
  }

  // Date range filters
  if (queryParams.createdAfter) {
    filter.createdAt = { ...filter.createdAt, $gte: new Date(queryParams.createdAfter) };
  }
  if (queryParams.createdBefore) {
    filter.createdAt = { ...filter.createdAt, $lte: new Date(queryParams.createdBefore) };
  }

  // Search
  if (queryParams.search) {
    filter.$or = [
      { name: { $regex: queryParams.search, $options: "i" } },
      { description: { $regex: queryParams.search, $options: "i" } },
      { shortDescription: { $regex: queryParams.search, $options: "i" } },
      { sku: { $regex: queryParams.search, $options: "i" } },
      { "seo.keywords": { $regex: queryParams.search, $options: "i" } },
    ];
  }

  // Tags filter
  if (queryParams.tags) {
    filter.tags = { $in: Array.isArray(queryParams.tags) ? queryParams.tags : [queryParams.tags] };
  }

  return filter;
}

/**
 * Get available filter options for a category with product counts
 * @param {string} categoryId - Category ID
 * @param {Object} baseFilter - Base filter to apply
 * @returns {Object} Available filters with counts
 */
async function getAvailableFiltersWithCounts(categoryId, baseFilter = {}) {
  const filters = {};

  // Get all attribute models
  const attributeModels = {
    brands: BrandV2,
    colors: ColorV2,
    sizes: SizeV2,
    materials: MaterialV2,
    genders: GenderV2,
    seasons: SeasonV2,
    styles: StyleV2,
    patterns: PatternV2,
    shoeHeights: ShoeHeightV2,
    fits: FitV2,
    occasions: OccasionV2,
    collarTypes: CollarTypeV2,
  };

  // Get counts for each attribute
  for (const [key, Model] of Object.entries(attributeModels)) {
    const items = await Model.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    
    const itemsWithCounts = await Promise.all(
      items.map(async (item) => {
        const count = await ProductV2.countDocuments({
          ...baseFilter,
          [key === "brands" ? "brandId" : `${key.slice(0, -1)}Id`]: item._id,
        });
        return {
          ...item.toObject(),
          count,
        };
      })
    );

    filters[key] = itemsWithCounts.filter(item => item.count > 0);
  }

  // Get price ranges
  const priceRanges = await ProductV2.aggregate([
    { $match: { ...baseFilter, "pricing.basePrice": { $exists: true } } },
    {
      $group: {
        _id: null,
        minPrice: { $min: "$pricing.basePrice" },
        maxPrice: { $max: "$pricing.basePrice" },
        avgPrice: { $avg: "$pricing.basePrice" },
      },
    },
  ]);

  if (priceRanges.length > 0) {
    filters.priceRange = priceRanges[0];
  }

  // Get rating distribution
  const ratingDistribution = await ProductV2.aggregate([
    { $match: { ...baseFilter, "rating.average": { $exists: true, $gt: 0 } } },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ["$rating.average", 2] }, then: "1-2" },
              { case: { $lt: ["$rating.average", 3] }, then: "2-3" },
              { case: { $lt: ["$rating.average", 4] }, then: "3-4" },
              { case: { $lt: ["$rating.average", 5] }, then: "4-5" },
            ],
            default: "5",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  filters.ratingDistribution = ratingDistribution;

  return filters;
}

/**
 * Build sort options for products
 * @param {string} sortParam - Sort parameter from request
 * @returns {Object} MongoDB sort object
 */
function buildSortOptions(sortParam) {
  const sortOptions = {
    "newest": { createdAt: -1 },
    "oldest": { createdAt: 1 },
    "name-asc": { name: 1 },
    "name-desc": { name: -1 },
    "price-asc": { "pricing.basePrice": 1 },
    "price-desc": { "pricing.basePrice": -1 },
    "rating": { "rating.average": -1, "rating.count": -1 },
    "popular": { salesCount: -1, views: -1 },
    "trending": { salesCount: -1, views: -1, createdAt: -1 },
    "relevance": { "rating.average": -1, salesCount: -1, views: -1 },
  };

  return sortOptions[sortParam] || { createdAt: -1 };
}

/**
 * Get search suggestions based on query
 * @param {string} query - Search query
 * @param {number} limit - Number of suggestions
 * @returns {Array} Search suggestions
 */
async function getSearchSuggestions(query, limit = 5) {
  const suggestions = await ProductV2.aggregate([
    {
      $match: {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { "seo.keywords": { $regex: query, $options: "i" } },
        ],
        status: "published",
        visibility: "public",
      },
    },
    {
      $group: {
        _id: "$categoryId",
        count: { $sum: 1 },
        category: { $first: "$categoryId" },
      },
    },
    {
      $lookup: {
        from: "categoryv2s",
        localField: "_id",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $unwind: "$categoryInfo",
    },
    {
      $project: {
        name: "$categoryInfo.name",
        slug: "$categoryInfo.slug",
        count: 1,
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return suggestions;
}

/**
 * Get related products based on various criteria
 * @param {string} productId - Product ID
 * @param {number} limit - Number of related products
 * @returns {Array} Related products
 */
async function getRelatedProducts(productId, limit = 4) {
  const product = await ProductV2.findById(productId);
  if (!product) return [];

  const relatedProducts = await ProductV2.find({
    _id: { $ne: productId },
    $or: [
      { categoryId: product.categoryId },
      { brandId: product.brandId },
      { genderId: product.genderId },
      { seasonId: product.seasonId },
      { styleId: product.styleId },
      { materialIds: { $in: product.materialIds } },
      { occasionIds: { $in: product.occasionIds } },
    ],
    status: "published",
    visibility: "public",
  })
    .populate(["categoryId", "brandId", "images.colorId"])
    .sort({ salesCount: -1, views: -1 })
    .limit(limit);

  return relatedProducts;
}

/**
 * Get trending products based on sales and views
 * @param {Object} filter - Base filter
 * @param {number} limit - Number of products
 * @returns {Array} Trending products
 */
async function getTrendingProducts(filter = {}, limit = 10) {
  const trendingProducts = await ProductV2.find({
    ...filter,
    status: "published",
    visibility: "public",
    salesCount: { $gt: 0 },
  })
    .populate(["categoryId", "brandId", "images.colorId"])
    .sort({ salesCount: -1, views: -1 })
    .limit(limit);

  return trendingProducts;
}

/**
 * Get new products (created within last 30 days)
 * @param {Object} filter - Base filter
 * @param {number} limit - Number of products
 * @returns {Array} New products
 */
async function getNewProducts(filter = {}, limit = 10) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const newProducts = await ProductV2.find({
    ...filter,
    status: "published",
    visibility: "public",
    createdAt: { $gte: thirtyDaysAgo },
  })
    .populate(["categoryId", "brandId", "images.colorId"])
    .sort({ createdAt: -1 })
    .limit(limit);

  return newProducts;
}

/**
 * Get products on sale
 * @param {Object} filter - Base filter
 * @param {number} limit - Number of products
 * @returns {Array} Products on sale
 */
async function getSaleProducts(filter = {}, limit = 10) {
  const saleProducts = await ProductV2.find({
    ...filter,
    status: "published",
    visibility: "public",
    "pricing.salePrice": { $exists: true, $gt: 0 },
    $expr: { $lt: ["$pricing.salePrice", "$pricing.basePrice"] },
  })
    .populate(["categoryId", "brandId", "images.colorId"])
    .sort({ "pricing.salePrice": 1 })
    .limit(limit);

  return saleProducts;
}

/**
 * Get best-selling products
 * @param {Object} filter - Base filter
 * @param {number} limit - Number of products
 * @returns {Array} Best-selling products
 */
async function getBestSellingProducts(filter = {}, limit = 10) {
  const bestSellingProducts = await ProductV2.find({
    ...filter,
    status: "published",
    visibility: "public",
    salesCount: { $gt: 0 },
  })
    .populate(["categoryId", "brandId", "images.colorId"])
    .sort({ salesCount: -1 })
    .limit(limit);

  return bestSellingProducts;
}

/**
 * Get most viewed products
 * @param {Object} filter - Base filter
 * @param {number} limit - Number of products
 * @returns {Array} Most viewed products
 */
async function getMostViewedProducts(filter = {}, limit = 10) {
  const mostViewedProducts = await ProductV2.find({
    ...filter,
    status: "published",
    visibility: "public",
    views: { $gt: 0 },
  })
    .populate(["categoryId", "brandId", "images.colorId"])
    .sort({ views: -1 })
    .limit(limit);

  return mostViewedProducts;
}

/**
 * Get highest rated products
 * @param {Object} filter - Base filter
 * @param {number} limit - Number of products
 * @returns {Array} Highest rated products
 */
async function getHighestRatedProducts(filter = {}, limit = 10) {
  const highestRatedProducts = await ProductV2.find({
    ...filter,
    status: "published",
    visibility: "public",
    "rating.average": { $gt: 0 },
    "rating.count": { $gte: 5 }, // At least 5 reviews
  })
    .populate(["categoryId", "brandId", "images.colorId"])
    .sort({ "rating.average": -1, "rating.count": -1 })
    .limit(limit);

  return highestRatedProducts;
}

module.exports = {
  buildAdvancedProductFilter,
  getAvailableFiltersWithCounts,
  buildSortOptions,
  getSearchSuggestions,
  getRelatedProducts,
  getTrendingProducts,
  getNewProducts,
  getSaleProducts,
  getBestSellingProducts,
  getMostViewedProducts,
  getHighestRatedProducts,
};

