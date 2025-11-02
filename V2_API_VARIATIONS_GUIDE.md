# V2 API Variations Guide

## Overview
This guide covers the different ways each V2 API endpoint can be used, including various request formats, parameter combinations, and use cases.

## Table of Contents
1. [Category API Variations](#category-api-variations)
2. [Product API Variations](#product-api-variations)
3. [Cart API Variations](#cart-api-variations)
4. [Order API Variations](#order-api-variations)
5. [User API Variations](#user-api-variations)
6. [File Upload Variations](#file-upload-variations)

## Category API Variations

### 1. Create Category

#### Variation 1: JSON Request (No Image)
```javascript
POST /api/v2/categories
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices",
  "parentCategory": null,  // Top-level category
  "isActive": true,
  "sortOrder": 1,
  "seo": {
    "metaTitle": "Electronics Store",
    "metaDescription": "Best electronics deals",
    "keywords": ["electronics", "devices"]
  }
}
```

#### Variation 2: Form Data with Image Upload
```javascript
POST /api/v2/categories
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("name", "Electronics");
formData.append("description", "Electronic devices");
formData.append("parentCategory", "");  // Empty string for top-level
formData.append("isActive", "true");
formData.append("sortOrder", "1");
formData.append("seo[metaTitle]", "Electronics Store");
formData.append("seo[metaDescription]", "Best electronics deals");
formData.append("seo[keywords]", "electronics,devices");
formData.append("image", imageFile);
```

#### Variation 3: Create Subcategory
```javascript
POST /api/v2/categories
Content-Type: application/json

{
  "name": "Smartphones",
  "description": "Mobile phones",
  "parentCategory": "68d563b71316aeed4c2b451",  // Parent category ID
  "isActive": true,
  "sortOrder": 1
}
```

### 2. Get Categories

#### Variation 1: Basic List
```javascript
GET /api/v2/categories
// Returns flat list with pagination
```

#### Variation 2: Hierarchical Tree
```javascript
GET /api/v2/categories/tree
// Returns nested structure with children arrays
```

#### Variation 3: Filter by Level
```javascript
GET /api/v2/categories?level=0  // Top-level only
GET /api/v2/categories?level=1  // Second level only
```

#### Variation 4: Filter by Parent
```javascript
GET /api/v2/categories?parentCategory=68d563b71316aeed4c2b451
GET /api/v2/categories?parentCategory=null  // Top-level categories
```

#### Variation 5: Search Categories
```javascript
GET /api/v2/categories?search=electronics&isActive=true
```

#### Variation 6: Pagination with Sorting
```javascript
GET /api/v2/categories?page=2&limit=10&sort=name&isActive=true
```

### 3. Update Category

#### Variation 1: JSON Update (No Image)
```javascript
PUT /api/v2/categories/{categoryId}
Content-Type: application/json

{
  "name": "Updated Electronics",
  "description": "Updated description",
  "isActive": true
}
```

#### Variation 2: Form Data with New Image
```javascript
PUT /api/v2/categories/{categoryId}
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("name", "Updated Electronics");
formData.append("description", "Updated description");
formData.append("isActive", "true");
formData.append("image", newImageFile);
```

#### Variation 3: Change Parent Category
```javascript
PUT /api/v2/categories/{categoryId}
Content-Type: application/json

{
  "parentCategory": "new_parent_category_id"
  // Level and path will be automatically recalculated
}
```

## Product API Variations

### 1. Create Product

#### Variation 1: Simple Product (JSON)
```javascript
POST /api/v2/products
Content-Type: application/json

{
  "name": "Basic T-Shirt",
  "description": "Simple cotton t-shirt",
  "productType": "simple",
  "categoryId": "category_id",
  "brandId": "brand_id",
  "pricing": {
    "basePrice": 29.99,
    "currency": "USD"
  },
  "inventory": {
    "stockQuantity": 100,
    "stockStatus": "in_stock"
  }
}
```

#### Variation 2: Variable Product (JSON)
```javascript
POST /api/v2/products
Content-Type: application/json

{
  "name": "Designer T-Shirt",
  "description": "T-shirt with variants",
  "productType": "variable",
  "categoryId": "category_id",
  "brandId": "brand_id",
  "pricing": {
    "basePrice": 39.99,
    "currency": "USD"
  }
  // Variants created separately
}
```

#### Variation 3: Product with Images (Form Data)
```javascript
POST /api/v2/products
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("name", "Product with Images");
formData.append("description", "Product description");
formData.append("productType", "simple");
formData.append("categoryId", "category_id");
formData.append("brandId", "brand_id");
formData.append("pricing[basePrice]", "99.99");
formData.append("pricing[currency]", "USD");
formData.append("inventory[stockQuantity]", "50");
formData.append("inventory[stockStatus]", "in_stock");
formData.append("images", imageFile1);
formData.append("images", imageFile2);
```

#### Variation 4: Complex Product with All Attributes
```javascript
POST /api/v2/products
Content-Type: application/json

{
  "name": "Premium Jacket",
  "description": "High-quality winter jacket",
  "productType": "variable",
  "categoryId": "category_id",
  "brandId": "brand_id",
  "genderId": "men_id",
  "seasonId": "winter_id",
  "styleId": "casual_id",
  "materialIds": ["cotton_id", "polyester_id"],
  "patternId": "solid_id",
  "occasionIds": ["casual_id", "work_id"],
  "pricing": {
    "basePrice": 199.99,
    "salePrice": 159.99,
    "costPrice": 100.00,
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
    "metaTitle": "Premium Jacket - Best Deals",
    "metaDescription": "High-quality winter jacket",
    "keywords": ["jacket", "winter", "premium"]
  }
}
```

### 2. Get Products

#### Variation 1: Basic Product List
```javascript
GET /api/v2/products?page=1&limit=20
```

#### Variation 2: Filtered by Category
```javascript
GET /api/v2/products?categoryId=electronics&page=1&limit=20
```

#### Variation 3: Advanced Filtering
```javascript
GET /api/v2/products?
  categoryId=electronics&
  brandId=nike&
  genderId=men&
  minPrice=50&
  maxPrice=200&
  stockStatus=in_stock&
  sort=price-asc
```

#### Variation 4: Search Products
```javascript
GET /api/v2/products/search?
  search=wireless headphones&
  categoryId=electronics&
  minPrice=50&
  maxPrice=300&
  sort=relevance
```

#### Variation 5: Trending Products
```javascript
GET /api/v2/products/trending?limit=10
```

#### Variation 6: New Products
```javascript
GET /api/v2/products/new?limit=10
```

#### Variation 7: Get Product by Slug
```javascript
GET /api/v2/products/slug/wireless-headphones
// Returns product with variants and related products
```

### 3. Create Product Variants

#### Variation 1: Basic Variant (JSON)
```javascript
POST /api/v2/products/{productId}/variants
Content-Type: application/json

{
  "sku": "TSH-001-RED-M",
  "colorId": "red_id",
  "sizeId": "medium_id",
  "pricing": {
    "basePrice": 29.99
  },
  "inventory": {
    "stockQuantity": 50
  }
}
```

#### Variation 2: Variant with Images (Form Data)
```javascript
POST /api/v2/products/{productId}/variants
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("sku", "TSH-001-RED-M");
formData.append("colorId", "red_id");
formData.append("sizeId", "medium_id");
formData.append("pricing[basePrice]", "29.99");
formData.append("inventory[stockQuantity]", "50");
formData.append("images", variantImageFile);
```

## Cart API Variations

### 1. Add to Cart

#### Variation 1: Simple Product
```javascript
POST /api/v2/cart/add
{
  "productId": "simple_product_id",
  "quantity": 2
}
```

#### Variation 2: Variable Product with Variant
```javascript
POST /api/v2/cart/add
{
  "productId": "variable_product_id",
  "variantId": "variant_id",
  "quantity": 1
}
```

#### Variation 3: Guest User (with session)
```javascript
POST /api/v2/cart/add
Headers: {
  'x-session-id': 'session_12345'
}
{
  "productId": "product_id",
  "quantity": 1
}
```

### 2. Cart Management

#### Variation 1: Get Cart (Authenticated)
```javascript
GET /api/v2/cart
Authorization: Bearer token
```

#### Variation 2: Get Cart (Guest)
```javascript
GET /api/v2/cart
Headers: {
  'x-session-id': 'session_12345'
}
```

#### Variation 3: Update Cart Item
```javascript
PUT /api/v2/cart/items/{itemId}
{
  "quantity": 3
}
```

#### Variation 4: Apply Coupon
```javascript
POST /api/v2/cart/coupon
{
  "couponCode": "SAVE20"
}
```

#### Variation 5: Merge Guest Cart with User Cart
```javascript
POST /api/v2/cart/merge
{
  "sessionId": "session_12345"
}
```

## Order API Variations

### 1. Checkout Process

#### Variation 1: Guest Checkout
```javascript
// Step 1: Initiate
POST /api/v2/orders/checkout/initiate
Headers: {
  'x-session-id': 'session_12345',
  'x-guest-id': 'guest_67890'
}

// Step 2: Complete
POST /api/v2/orders/checkout/complete
Headers: {
  'x-session-id': 'session_12345',
  'x-guest-id': 'guest_67890'
}
{
  "addressId": "address_id",
  "deliveryOptionId": "delivery_option_id",
  "paymentMethod": "credit_card"
}
```

#### Variation 2: Authenticated User Checkout
```javascript
// Step 1: Initiate
POST /api/v2/orders/checkout/initiate
Authorization: Bearer token

// Step 2: Complete
POST /api/v2/orders/checkout/complete
Authorization: Bearer token
{
  "addressId": "address_id",
  "deliveryOptionId": "delivery_option_id",
  "paymentMethod": "credit_card",
  "notes": "Special instructions"
}
```

### 2. Order Retrieval

#### Variation 1: Get User Orders (Authenticated)
```javascript
GET /api/v2/orders?page=1&limit=20
Authorization: Bearer token
```

#### Variation 2: Get Orders by Status
```javascript
GET /api/v2/orders?status=pending&page=1&limit=20
```

#### Variation 3: Get Guest Orders
```javascript
GET /api/v2/orders?page=1&limit=20
Headers: {
  'x-session-id': 'session_12345'
}
```

## User API Variations

### 1. User Registration

#### Variation 1: Basic Registration
```javascript
POST /api/v2/users/register
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Variation 2: Registration with Profile
```javascript
POST /api/v2/users/register
{
  "email": "user@example.com",
  "password": "password123",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "preferences": {
    "currency": "USD",
    "language": "en",
    "newsletter": true
  }
}
```

### 2. User Profile Management

#### Variation 1: Update Profile (JSON)
```javascript
PUT /api/v2/users/profile
Authorization: Bearer token
{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "preferences": {
    "currency": "EUR",
    "language": "en"
  }
}
```

#### Variation 2: Update Profile with Avatar (Form Data)
```javascript
PUT /api/v2/users/profile
Authorization: Bearer token
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("profile[firstName]", "John");
formData.append("profile[lastName]", "Doe");
formData.append("profile[phone]", "+1234567890");
formData.append("preferences[currency]", "EUR");
formData.append("preferences[language]", "en");
formData.append("avatar", avatarFile);
```

### 3. Address Management

#### Variation 1: Create Address
```javascript
POST /api/v2/addresses
Authorization: Bearer token
{
  "type": "shipping",
  "firstName": "John",
  "lastName": "Doe",
  "addressLine1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "US",
  "isDefault": true
}
```

#### Variation 2: Create Address (Guest)
```javascript
POST /api/v2/addresses
Headers: {
  'x-session-id': 'session_12345'
}
{
  "type": "shipping",
  "firstName": "John",
  "lastName": "Doe",
  "addressLine1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "US"
}
```

## File Upload Variations

### 1. Category Image Upload

#### Variation 1: Create Category with Image
```javascript
POST /api/v2/categories
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("name", "Category Name");
formData.append("description", "Category description");
formData.append("isActive", "true");
formData.append("image", imageFile);
```

#### Variation 2: Update Category with New Image
```javascript
PUT /api/v2/categories/{categoryId}
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("name", "Updated Category");
formData.append("image", newImageFile);
```

### 2. Brand Logo Upload

#### Variation 1: Create Brand with Logo
```javascript
POST /api/v2/brands
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("name", "Brand Name");
formData.append("description", "Brand description");
formData.append("website", "https://brand.com");
formData.append("logo", logoFile);
```

### 3. Product Images Upload

#### Variation 1: Create Product with Multiple Images
```javascript
POST /api/v2/products
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("name", "Product Name");
formData.append("description", "Product description");
formData.append("categoryId", "category_id");
formData.append("brandId", "brand_id");
formData.append("pricing[basePrice]", "99.99");
formData.append("images", imageFile1);
formData.append("images", imageFile2);
formData.append("images", imageFile3);
```

#### Variation 2: Update Product with Additional Images
```javascript
PUT /api/v2/products/{productId}
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("name", "Updated Product");
formData.append("images", additionalImageFile);
```

### 4. User Avatar Upload

#### Variation 1: Update Profile with Avatar
```javascript
PUT /api/v2/users/profile
Authorization: Bearer token
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("profile[firstName]", "John");
formData.append("profile[lastName]", "Doe");
formData.append("avatar", avatarFile);
```

## Common Patterns

### 1. Pagination Pattern
```javascript
// Always include pagination parameters
GET /api/v2/products?page=1&limit=20&sort=name
```

### 2. Filtering Pattern
```javascript
// Chain multiple filters
GET /api/v2/products?categoryId=cat&brandId=brand&minPrice=50&maxPrice=200
```

### 3. Search Pattern
```javascript
// Use search endpoint for text-based queries
GET /api/v2/products/search?search=query&categoryId=cat
```

### 4. File Upload Pattern
```javascript
// Always use multipart/form-data for file uploads
Content-Type: multipart/form-data
```

### 5. Authentication Pattern
```javascript
// Include authorization header for protected endpoints
Authorization: Bearer your_jwt_token
```

### 6. Guest User Pattern
```javascript
// Include session headers for guest users
Headers: {
  'x-session-id': 'session_id',
  'x-guest-id': 'guest_id'  // Optional
}
```

## Error Handling Patterns

### 1. Validation Errors
```javascript
// Check for validation errors
if (!response.success && response.error.includes('validation failed')) {
  // Handle validation error
}
```

### 2. File Upload Errors
```javascript
// Check for file upload errors
if (!response.success && response.error.includes('upload failed')) {
  // Handle file upload error
}
```

### 3. Authentication Errors
```javascript
// Check for authentication errors
if (response.status === 401) {
  // Redirect to login
}
```

### 4. Stock Errors
```javascript
// Check for stock errors
if (!response.success && response.error.includes('Insufficient stock')) {
  // Handle stock error
}
```

