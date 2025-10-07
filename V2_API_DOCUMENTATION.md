# E-commerce SaaS API v2 Documentation

## Overview

The v2 API provides enhanced product filtering capabilities with a comprehensive attribute system. This version includes advanced filtering, better product management, and improved user experience.

## Base URL

```
/api/v2
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Product Attributes

The v2 API includes the following product attributes for advanced filtering:

- **Colors**: Product colors with hex codes
- **Sizes**: Size options for different categories (clothing, shoes, accessories)
- **Materials**: Product materials with composition details
- **Genders**: Target gender (men, women, unisex, kids)
- **Seasons**: Seasonal appropriateness
- **Styles**: Product styles (casual, formal, sporty, etc.)
- **Patterns**: Pattern types (solid, striped, floral, etc.)
- **Shoe Heights**: For footwear (flat, low, medium, high)
- **Fits**: Fit types (slim, regular, loose, etc.)
- **Occasions**: Use occasions (work, party, casual, etc.)
- **Collar Types**: For shirts/tops (crew, v-neck, polo, etc.)

## API Endpoints

### Products

#### Get Products with Advanced Filtering
```
GET /api/v2/products
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `sort` (string): Sort order (newest, oldest, name-asc, name-desc, price-asc, price-desc, rating, popular, trending)
- `search` (string): Search query
- `categoryId` (string): Filter by category
- `brandId` (string): Filter by brand
- `genderId` (string): Filter by gender
- `seasonId` (string): Filter by season
- `styleId` (string): Filter by style
- `patternId` (string): Filter by pattern
- `shoeHeightId` (string): Filter by shoe height
- `fitId` (string): Filter by fit
- `collarTypeId` (string): Filter by collar type
- `materialIds` (array): Filter by materials
- `occasionIds` (array): Filter by occasions
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `minSalePrice` (number): Minimum sale price
- `maxSalePrice` (number): Maximum sale price
- `stockStatus` (string): Stock status (in_stock, out_of_stock, backorder)
- `minStock` (number): Minimum stock quantity
- `maxStock` (number): Maximum stock quantity
- `productType` (string): Product type (simple, variable, grouped, virtual, downloadable)
- `minRating` (number): Minimum rating
- `minSales` (number): Minimum sales count
- `minViews` (number): Minimum views
- `createdAfter` (date): Created after date
- `createdBefore` (date): Created before date
- `tags` (array): Filter by tags
- `status` (string): Product status (draft, published, archived)
- `visibility` (string): Product visibility (public, private, hidden)

**Response:**
```json
{
  "success": true,
  "products": [...],
  "total": 100,
  "page": 1,
  "pages": 5,
  "filters": {
    "brands": [...],
    "colors": [...],
    "sizes": [...],
    "materials": [...],
    "genders": [...],
    "seasons": [...],
    "styles": [...],
    "patterns": [...],
    "shoeHeights": [...],
    "fits": [...],
    "occasions": [...],
    "collarTypes": [...],
    "priceRange": {
      "minPrice": 10,
      "maxPrice": 500,
      "avgPrice": 150
    },
    "ratingDistribution": [...]
  }
}
```

#### Search Products
```
GET /api/v2/products/search
```

**Query Parameters:** Same as Get Products, plus:
- `search` (string, required): Search query

**Response:**
```json
{
  "success": true,
  "products": [...],
  "total": 50,
  "page": 1,
  "pages": 3,
  "suggestions": [
    {
      "name": "Category Name",
      "slug": "category-slug",
      "count": 25
    }
  ]
}
```

#### Get Product by ID
```
GET /api/v2/products/:id
```

**Response:**
```json
{
  "success": true,
  "product": {
    "_id": "...",
    "name": "Product Name",
    "slug": "product-slug",
    "description": "Product description",
    "shortDescription": "Short description",
    "sku": "PROD-001",
    "categoryId": {...},
    "brandId": {...},
    "genderId": {...},
    "seasonId": {...},
    "styleId": {...},
    "materialIds": [...],
    "patternId": {...},
    "shoeHeightId": {...},
    "fitId": {...},
    "occasionIds": [...],
    "collarTypeId": {...},
    "productType": "simple",
    "pricing": {
      "basePrice": 100,
      "salePrice": 80,
      "costPrice": 50,
      "currency": "USD"
    },
    "inventory": {
      "trackInventory": true,
      "stockQuantity": 50,
      "stockStatus": "in_stock",
      "lowStockThreshold": 5,
      "allowBackorders": false
    },
    "dimensions": {
      "length": 30,
      "width": 20,
      "height": 5,
      "weight": 0.5,
      "unit": "cm"
    },
    "images": [...],
    "seo": {
      "metaTitle": "SEO Title",
      "metaDescription": "SEO Description",
      "keywords": ["keyword1", "keyword2"]
    },
    "status": "published",
    "visibility": "public",
    "views": 100,
    "salesCount": 25,
    "rating": {
      "average": 4.5,
      "count": 10
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "relatedProducts": [...]
}
```

#### Get Product by Slug
```
GET /api/v2/products/slug/:slug
```

**Response:** Same as Get Product by ID, plus:
```json
{
  "variants": [...] // If product type is "variable"
}
```

#### Get Product Variants
```
GET /api/v2/products/:productId/variants
```

**Response:**
```json
{
  "success": true,
  "variants": [
    {
      "_id": "...",
      "productId": "...",
      "sku": "PROD-001-RED-M",
      "colorId": {...},
      "sizeId": {...},
      "genderId": {...},
      "pricing": {
        "basePrice": 100,
        "salePrice": 80,
        "costPrice": 50
      },
      "inventory": {
        "stockQuantity": 25,
        "stockStatus": "in_stock"
      },
      "images": [...],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Filter Options for Category
```
GET /api/v2/products/category/:categoryId/filters
```

**Query Parameters:** Same filter parameters as Get Products

**Response:**
```json
{
  "success": true,
  "filters": {
    "brands": [...],
    "colors": [...],
    "sizes": [...],
    "materials": [...],
    "genders": [...],
    "seasons": [...],
    "styles": [...],
    "patterns": [...],
    "shoeHeights": [...],
    "fits": [...],
    "occasions": [...],
    "collarTypes": [...],
    "priceRange": {...},
    "ratingDistribution": [...]
  }
}
```

#### Get Trending Products
```
GET /api/v2/products/trending
```

**Query Parameters:**
- `limit` (number): Number of products (default: 10)

#### Get New Products
```
GET /api/v2/products/new
```

**Query Parameters:**
- `limit` (number): Number of products (default: 10)

#### Create Product (Admin Only)
```
POST /api/v2/products
```

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "shortDescription": "Short description",
  "sku": "PROD-001",
  "categoryId": "category-id",
  "brandId": "brand-id",
  "genderId": "gender-id",
  "seasonId": "season-id",
  "styleId": "style-id",
  "materialIds": ["material-id-1", "material-id-2"],
  "patternId": "pattern-id",
  "shoeHeightId": "shoe-height-id",
  "fitId": "fit-id",
  "occasionIds": ["occasion-id-1", "occasion-id-2"],
  "collarTypeId": "collar-type-id",
  "productType": "simple",
  "pricing": {
    "basePrice": 100,
    "salePrice": 80,
    "costPrice": 50,
    "currency": "USD"
  },
  "inventory": {
    "trackInventory": true,
    "stockQuantity": 50,
    "stockStatus": "in_stock",
    "lowStockThreshold": 5,
    "allowBackorders": false
  },
  "dimensions": {
    "length": 30,
    "width": 20,
    "height": 5,
    "weight": 0.5,
    "unit": "cm"
  },
  "seo": {
    "metaTitle": "SEO Title",
    "metaDescription": "SEO Description",
    "keywords": ["keyword1", "keyword2"]
  },
  "status": "published",
  "visibility": "public"
}
```

#### Update Product (Admin Only)
```
PUT /api/v2/products/:id
```

#### Delete Product (Admin Only)
```
DELETE /api/v2/products/:id
```

#### Create Product Variant (Admin Only)
```
POST /api/v2/products/:productId/variants
```

#### Update Product Variant (Admin Only)
```
PUT /api/v2/products/variants/:variantId
```

#### Delete Product Variant (Admin Only)
```
DELETE /api/v2/products/variants/:variantId
```

### Categories

#### Get Categories
```
GET /api/v2/categories
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `sort` (string): Sort order
- `parentCategory` (string): Filter by parent category
- `level` (number): Filter by level
- `isActive` (boolean): Filter by active status
- `search` (string): Search query

#### Get Category Tree
```
GET /api/v2/categories/tree
```

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "_id": "...",
      "name": "Parent Category",
      "slug": "parent-category",
      "level": 0,
      "children": [
        {
          "_id": "...",
          "name": "Child Category",
          "slug": "child-category",
          "level": 1,
          "children": []
        }
      ]
    }
  ]
}
```

#### Get Category by ID
```
GET /api/v2/categories/:id
```

#### Get Category by Slug
```
GET /api/v2/categories/slug/:slug
```

#### Get Category Breadcrumb
```
GET /api/v2/categories/:id/breadcrumb
```

#### Create Category (Admin Only)
```
POST /api/v2/categories
```

#### Update Category (Admin Only)
```
PUT /api/v2/categories/:id
```

#### Delete Category (Admin Only)
```
DELETE /api/v2/categories/:id
```

### Brands

#### Get Brands
```
GET /api/v2/brands
```

#### Get Brand by ID
```
GET /api/v2/brands/:id
```

#### Get Brand by Slug
```
GET /api/v2/brands/slug/:slug
```

#### Create Brand (Admin Only)
```
POST /api/v2/brands
```

#### Update Brand (Admin Only)
```
PUT /api/v2/brands/:id
```

#### Delete Brand (Admin Only)
```
DELETE /api/v2/brands/:id
```

### Attributes

All attribute endpoints follow the same pattern:

#### Colors
- `GET /api/v2/attributes/colors`
- `GET /api/v2/attributes/colors/:id`
- `GET /api/v2/attributes/colors/slug/:slug`
- `POST /api/v2/attributes/colors` (Admin Only)
- `PUT /api/v2/attributes/colors/:id` (Admin Only)
- `DELETE /api/v2/attributes/colors/:id` (Admin Only)

#### Sizes
- `GET /api/v2/attributes/sizes`
- `GET /api/v2/attributes/sizes/:id`
- `GET /api/v2/attributes/sizes/slug/:slug`
- `POST /api/v2/attributes/sizes` (Admin Only)
- `PUT /api/v2/attributes/sizes/:id` (Admin Only)
- `DELETE /api/v2/attributes/sizes/:id` (Admin Only)

#### Materials
- `GET /api/v2/attributes/materials`
- `GET /api/v2/attributes/materials/:id`
- `GET /api/v2/attributes/materials/slug/:slug`
- `POST /api/v2/attributes/materials` (Admin Only)
- `PUT /api/v2/attributes/materials/:id` (Admin Only)
- `DELETE /api/v2/attributes/materials/:id` (Admin Only)

#### Genders
- `GET /api/v2/attributes/genders`
- `GET /api/v2/attributes/genders/:id`
- `GET /api/v2/attributes/genders/slug/:slug`
- `POST /api/v2/attributes/genders` (Admin Only)
- `PUT /api/v2/attributes/genders/:id` (Admin Only)
- `DELETE /api/v2/attributes/genders/:id` (Admin Only)

#### Seasons
- `GET /api/v2/attributes/seasons`
- `GET /api/v2/attributes/seasons/:id`
- `GET /api/v2/attributes/seasons/slug/:slug`
- `POST /api/v2/attributes/seasons` (Admin Only)
- `PUT /api/v2/attributes/seasons/:id` (Admin Only)
- `DELETE /api/v2/attributes/seasons/:id` (Admin Only)

#### Styles
- `GET /api/v2/attributes/styles`
- `GET /api/v2/attributes/styles/:id`
- `GET /api/v2/attributes/styles/slug/:slug`
- `GET /api/v2/attributes/styles/category/:categoryId`
- `POST /api/v2/attributes/styles` (Admin Only)
- `PUT /api/v2/attributes/styles/:id` (Admin Only)
- `DELETE /api/v2/attributes/styles/:id` (Admin Only)

#### Patterns
- `GET /api/v2/attributes/patterns`
- `GET /api/v2/attributes/patterns/:id`
- `GET /api/v2/attributes/patterns/slug/:slug`
- `POST /api/v2/attributes/patterns` (Admin Only)
- `PUT /api/v2/attributes/patterns/:id` (Admin Only)
- `DELETE /api/v2/attributes/patterns/:id` (Admin Only)

#### Shoe Heights
- `GET /api/v2/attributes/shoe-heights`
- `GET /api/v2/attributes/shoe-heights/:id`
- `GET /api/v2/attributes/shoe-heights/slug/:slug`
- `GET /api/v2/attributes/shoe-heights/category/:categoryId`
- `POST /api/v2/attributes/shoe-heights` (Admin Only)
- `PUT /api/v2/attributes/shoe-heights/:id` (Admin Only)
- `DELETE /api/v2/attributes/shoe-heights/:id` (Admin Only)

#### Fits
- `GET /api/v2/attributes/fits`
- `GET /api/v2/attributes/fits/:id`
- `GET /api/v2/attributes/fits/slug/:slug`
- `GET /api/v2/attributes/fits/category/:categoryId`
- `POST /api/v2/attributes/fits` (Admin Only)
- `PUT /api/v2/attributes/fits/:id` (Admin Only)
- `DELETE /api/v2/attributes/fits/:id` (Admin Only)

#### Occasions
- `GET /api/v2/attributes/occasions`
- `GET /api/v2/attributes/occasions/:id`
- `GET /api/v2/attributes/occasions/slug/:slug`
- `POST /api/v2/attributes/occasions` (Admin Only)
- `PUT /api/v2/attributes/occasions/:id` (Admin Only)
- `DELETE /api/v2/attributes/occasions/:id` (Admin Only)

#### Collar Types
- `GET /api/v2/attributes/collar-types`
- `GET /api/v2/attributes/collar-types/:id`
- `GET /api/v2/attributes/collar-types/slug/:slug`
- `GET /api/v2/attributes/collar-types/category/:categoryId`
- `POST /api/v2/attributes/collar-types` (Admin Only)
- `PUT /api/v2/attributes/collar-types/:id` (Admin Only)
- `DELETE /api/v2/attributes/collar-types/:id` (Admin Only)

#### Get All Attributes for Category
```
GET /api/v2/attributes/category/:categoryId/all
```

**Response:**
```json
{
  "success": true,
  "attributes": {
    "colors": [...],
    "sizes": [...],
    "materials": [...],
    "genders": [...],
    "seasons": [...],
    "styles": [...],
    "patterns": [...],
    "shoeHeights": [...],
    "fits": [...],
    "occasions": [...],
    "collarTypes": [...]
  }
}
```

### Users

#### Register User
```
POST /api/v2/users/register
```

#### Login User
```
POST /api/v2/users/login
```

#### Create Guest User
```
POST /api/v2/users/guest
```

#### Get User Profile
```
GET /api/v2/users/profile
```

#### Update User Profile
```
PUT /api/v2/users/profile
```

#### Change Password
```
PUT /api/v2/users/change-password
```

#### Get User Addresses
```
GET /api/v2/users/addresses
```

#### Create Address
```
POST /api/v2/users/addresses
```

#### Get Address by ID
```
GET /api/v2/users/addresses/:id
```

#### Update Address
```
PUT /api/v2/users/addresses/:id
```

#### Delete Address
```
DELETE /api/v2/users/addresses/:id
```

#### Get All Users (Admin Only)
```
GET /api/v2/users
```

#### Get User by ID (Admin Only)
```
GET /api/v2/users/:id
```

#### Update User (Admin Only)
```
PUT /api/v2/users/:id
```

#### Delete User (Admin Only)
```
DELETE /api/v2/users/:id
```

### Cart

#### Get Cart
```
GET /api/v2/cart
```

**Headers:**
- `x-guest-id`: Guest user ID (for guest users)
- `x-session-id`: Session ID (for guest users)

#### Add to Cart
```
POST /api/v2/cart/add
```

**Request Body:**
```json
{
  "productId": "product-id",
  "variantId": "variant-id", // Optional
  "quantity": 1
}
```

#### Update Cart Item
```
PUT /api/v2/cart/items/:itemId
```

**Request Body:**
```json
{
  "quantity": 2
}
```

#### Remove from Cart
```
DELETE /api/v2/cart/items/:itemId
```

#### Clear Cart
```
DELETE /api/v2/cart/clear
```

#### Apply Coupon
```
POST /api/v2/cart/coupon
```

**Request Body:**
```json
{
  "couponCode": "SAVE10"
}
```

#### Remove Coupon
```
DELETE /api/v2/cart/coupon
```

#### Merge Cart (Authenticated Users Only)
```
POST /api/v2/cart/merge
```

**Request Body:**
```json
{
  "guestId": "guest-id",
  "sessionId": "session-id"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

API requests are rate limited to prevent abuse. Check response headers for rate limit information.

## Pagination

Most list endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

Response includes:
- `total`: Total number of items
- `page`: Current page number
- `pages`: Total number of pages

## Filtering

The v2 API provides comprehensive filtering capabilities:

1. **Basic Filters**: Category, brand, price range, stock status
2. **Attribute Filters**: All product attributes (colors, sizes, materials, etc.)
3. **Advanced Filters**: Rating, sales count, views, date ranges
4. **Search**: Full-text search across product fields
5. **Sorting**: Multiple sort options including relevance

## Examples

### Filter Products by Multiple Attributes
```
GET /api/v2/products?categoryId=cat123&brandId=brand456&genderId=gender789&minPrice=50&maxPrice=200&materialIds[]=mat1&materialIds[]=mat2&sort=price-asc
```

### Search Products
```
GET /api/v2/products/search?search=red shirt&categoryId=cat123&sort=relevance
```

### Get Filter Options
```
GET /api/v2/products/category/cat123/filters?brandId=brand456&genderId=gender789
```

This will return available filter options based on the current filter state, showing only options that have products available.

