# V2 API Usage Guidelines

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Category Management](#category-management)
4. [Product Management](#product-management)
5. [Cart Management](#cart-management)
6. [Order Management](#order-management)
7. [Customer User Flow](#customer-user-flow)
8. [File Upload Guidelines](#file-upload-guidelines)
9. [Error Handling](#error-handling)

## Overview

The V2 API provides a comprehensive ecommerce solution with advanced filtering, hierarchical categories, multiple product types, and complete order management. Each API endpoint can be used in multiple ways depending on your specific needs.

## Authentication

### Bearer Token Authentication
```javascript
const headers = {
  'Authorization': 'Bearer your_jwt_token_here',
  'Content-Type': 'application/json'
};
```

### Guest/Session Support
For guest users, use session headers:
```javascript
const headers = {
  'x-session-id': 'session_12345',
  'x-guest-id': 'guest_67890'
};
```

## Category Management

### 1. Creating Categories

#### Top-Level Category (No Parent)
```javascript
// Method 1: JSON Request
const categoryData = {
  name: "Electronics",
  description: "Electronic devices and accessories",
  isActive: true,
  sortOrder: 1,
  seo: {
    metaTitle: "Electronics - Best Deals",
    metaDescription: "Shop the latest electronics",
    keywords: ["electronics", "devices"]
  }
  // parentCategory is omitted or null
};

// Method 2: Form Data with Image Upload
const formData = new FormData();
formData.append("name", "Electronics");
formData.append("description", "Electronic devices");
formData.append("isActive", "true");
formData.append("sortOrder", "1");
formData.append("seo[metaTitle]", "Electronics - Best Deals");
formData.append("seo[metaDescription]", "Shop the latest electronics");
formData.append("seo[keywords]", "electronics,devices");
formData.append("image", imageFile); // Optional image upload
```

#### Subcategory (With Parent)
```javascript
// First, get the parent category ID from creating Electronics
const parentCategoryId = "68d563b71316aeed4c2b451";

const subcategoryData = {
  name: "Smartphones",
  description: "Mobile phones and accessories",
  parentCategory: parentCategoryId, // Reference to parent
  isActive: true,
  sortOrder: 1
};
```

### 2. Category Retrieval Methods

#### Get All Categories (Flat List)
```javascript
GET /api/v2/categories?page=1&limit=20&sort=sortOrder
```

#### Get Category Tree (Hierarchical)
```javascript
GET /api/v2/categories/tree
// Returns nested structure with children arrays
```

#### Get Categories by Level
```javascript
GET /api/v2/categories?level=0  // Top-level only
GET /api/v2/categories?level=1  // Second level only
```

#### Get Categories by Parent
```javascript
GET /api/v2/categories?parentCategory=68d563b71316aeed4c2b451
GET /api/v2/categories?parentCategory=null  // Top-level categories
```

#### Search Categories
```javascript
GET /api/v2/categories?search=electronics
```

### 3. Category Hierarchy Benefits
- **Automatic Level Calculation**: Level 0 for root, Level 1 for subcategories, etc.
- **Path Generation**: Creates URL-friendly paths like "electronics/smartphones"
- **Breadcrumb Support**: Easy navigation trail generation
- **SEO Optimization**: Hierarchical structure improves search rankings

## Product Management

### 1. Product Types

The V2 API supports multiple product types with different handling:

#### Simple Products
```javascript
const simpleProduct = {
  name: "Basic T-Shirt",
  description: "A simple cotton t-shirt",
  productType: "simple", // Default
  pricing: {
    basePrice: 29.99,
    currency: "USD"
  },
  inventory: {
    stockQuantity: 100,
    stockStatus: "in_stock"
  }
};
```

#### Variable Products (With Variants)
```javascript
const variableProduct = {
  name: "Designer T-Shirt",
  description: "T-shirt with multiple color and size options",
  productType: "variable",
  pricing: {
    basePrice: 39.99,
    currency: "USD"
  }
  // Variants are created separately
};

// Create variants for the variable product
const variant1 = {
  sku: "TSH-DESIGN-RED-M",
  colorId: "red_color_id",
  sizeId: "medium_size_id",
  pricing: {
    basePrice: 39.99
  },
  inventory: {
    stockQuantity: 50
  }
};
```

#### Grouped Products
```javascript
const groupedProduct = {
  name: "Gift Bundle",
  productType: "grouped",
  // Contains multiple related products
};
```

#### Virtual Products
```javascript
const virtualProduct = {
  name: "Digital Download",
  productType: "virtual",
  // No physical shipping required
};
```

#### Downloadable Products
```javascript
const downloadableProduct = {
  name: "Software License",
  productType: "downloadable",
  // Digital delivery with download links
};
```

### 2. Product Creation Methods

#### JSON Request (No Images)
```javascript
POST /api/v2/products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "categoryId": "category_id",
  "brandId": "brand_id",
  "pricing": {
    "basePrice": 99.99,
    "currency": "USD"
  }
}
```

#### Form Data Request (With Images)
```javascript
POST /api/v2/products
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("name", "Product with Images");
formData.append("description", "Product description");
formData.append("categoryId", "category_id");
formData.append("brandId", "brand_id");
formData.append("pricing[basePrice]", "99.99");
formData.append("pricing[currency]", "USD");
formData.append("images", imageFile1); // Multiple images supported
formData.append("images", imageFile2);
```

### 3. Advanced Product Filtering

#### Basic Filtering
```javascript
GET /api/v2/products?categoryId=cat123&brandId=brand456&minPrice=50&maxPrice=200
```

#### Advanced Attribute Filtering
```javascript
GET /api/v2/products?
  categoryId=cat123&
  genderId=women&
  seasonId=summer&
  materialIds[]=cotton&
  materialIds[]=polyester&
  colorIds[]=red&
  colorIds[]=blue&
  sizeIds[]=medium&
  sizeIds[]=large
```

#### Search with Filters
```javascript
GET /api/v2/products/search?
  search=summer dress&
  categoryId=cat123&
  minPrice=30&
  maxPrice=150&
  sort=relevance
```

#### Stock-Based Filtering
```javascript
GET /api/v2/products?stockStatus=in_stock&minStock=10
```

#### Date Range Filtering
```javascript
GET /api/v2/products?createdAfter=2024-01-01&createdBefore=2024-12-31
```

### 4. Product Variants

#### Creating Variants
```javascript
// For variable products
POST /api/v2/products/{productId}/variants

{
  "sku": "TSH-001-RED-M",
  "colorId": "red_color_id",
  "sizeId": "medium_size_id",
  "pricing": {
    "basePrice": 29.99
  },
  "inventory": {
    "stockQuantity": 50
  }
}
```

#### Variant with Images
```javascript
// Form data for variant with images
const variantFormData = new FormData();
variantFormData.append("sku", "TSH-001-RED-M");
variantFormData.append("colorId", "red_color_id");
variantFormData.append("sizeId", "medium_size_id");
variantFormData.append("pricing[basePrice]", "29.99");
variantFormData.append("inventory[stockQuantity]", "50");
variantFormData.append("images", variantImageFile);
```

## Cart Management

### 1. Adding Items to Cart

#### Simple Product
```javascript
POST /api/v2/cart/add
{
  "productId": "product_id",
  "quantity": 2
}
```

#### Variable Product with Variant
```javascript
POST /api/v2/cart/add
{
  "productId": "product_id",
  "variantId": "variant_id", // Required for variable products
  "quantity": 1
}
```

### 2. Cart Operations

#### Get Cart
```javascript
GET /api/v2/cart
// Returns cart with populated product and variant details
```

#### Update Cart Item
```javascript
PUT /api/v2/cart/items/{itemId}
{
  "quantity": 3
}
```

#### Remove from Cart
```javascript
DELETE /api/v2/cart/items/{itemId}
```

#### Clear Cart
```javascript
DELETE /api/v2/cart/clear
```

#### Apply Coupon
```javascript
POST /api/v2/cart/coupon
{
  "couponCode": "SAVE10"
}
```

#### Merge Guest Cart with User Cart
```javascript
POST /api/v2/cart/merge
{
  "sessionId": "session_12345"
}
```

## Order Management

### 1. Checkout Process

#### Step 1: Initiate Checkout
```javascript
POST /api/v2/orders/checkout/initiate
Headers: {
  'x-session-id': 'session_12345',
  'x-guest-id': 'guest_67890' // Optional
}
```

#### Step 2: Complete Checkout
```javascript
POST /api/v2/orders/checkout/complete
{
  "addressId": "address_id",
  "deliveryOptionId": "delivery_option_id",
  "paymentMethod": "credit_card",
  "notes": "Special delivery instructions"
}
```

### 2. Order Retrieval

#### Get User Orders
```javascript
GET /api/v2/orders?page=1&limit=20&status=pending
```

#### Get Order by ID
```javascript
GET /api/v2/orders/{orderId}
```

## Customer User Flow

### Complete Customer Journey

#### 1. Browsing Phase
```javascript
// 1.1 Get category tree for navigation
GET /api/v2/categories/tree

// 1.2 Browse products by category
GET /api/v2/products?categoryId=electronics&page=1&limit=20

// 1.3 Apply filters
GET /api/v2/products?categoryId=electronics&brandId=nike&minPrice=50&maxPrice=200

// 1.4 Search for specific products
GET /api/v2/products/search?search=wireless headphones

// 1.5 Get product details
GET /api/v2/products/{productId}
// For variable products, this also returns available variants
```

#### 2. Product Selection Phase
```javascript
// 2.1 For simple products - add directly to cart
POST /api/v2/cart/add
{
  "productId": "simple_product_id",
  "quantity": 2
}

// 2.2 For variable products - select variant first
// Get product details to see available variants
GET /api/v2/products/{productId}
// Then add specific variant to cart
POST /api/v2/cart/add
{
  "productId": "variable_product_id",
  "variantId": "selected_variant_id",
  "quantity": 1
}
```

#### 3. Cart Management Phase
```javascript
// 3.1 View cart contents
GET /api/v2/cart

// 3.2 Update quantities
PUT /api/v2/cart/items/{itemId}
{
  "quantity": 3
}

// 3.3 Remove items
DELETE /api/v2/cart/items/{itemId}

// 3.4 Apply discount codes
POST /api/v2/cart/coupon
{
  "couponCode": "SAVE20"
}
```

#### 4. Checkout Phase
```javascript
// 4.1 User registration/login (if not already)
POST /api/v2/users/register
POST /api/v2/users/login

// 4.2 Create/select shipping address
POST /api/v2/addresses
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

// 4.3 Get available delivery options
GET /api/v2/delivery/available?cartTotal=150&weight=2&region=US

// 4.4 Initiate checkout
POST /api/v2/orders/checkout/initiate
Headers: {
  'x-session-id': 'session_12345'
}

// 4.5 Complete checkout
POST /api/v2/orders/checkout/complete
{
  "addressId": "address_id",
  "deliveryOptionId": "delivery_option_id",
  "paymentMethod": "credit_card"
}
```

#### 5. Post-Purchase Phase
```javascript
// 5.1 View order confirmation
// Response from checkout completion includes order details

// 5.2 Track order status
GET /api/v2/orders/{orderId}

// 5.3 View order history
GET /api/v2/orders?page=1&limit=20

// 5.4 Update user profile
PUT /api/v2/users/profile
{
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Guest vs Authenticated User Flow

#### Guest User Flow
1. Browse products (no authentication required)
2. Add items to cart (uses session ID)
3. Create temporary address for checkout
4. Complete checkout as guest
5. Receive order confirmation

#### Authenticated User Flow
1. Register/Login first
2. Browse products
3. Add items to cart (linked to user account)
4. Use saved addresses or create new ones
5. Complete checkout
6. Order is linked to user account for future reference

## File Upload Guidelines

### Supported File Types
- **Images Only**: JPEG, PNG, WebP, GIF
- **File Size Limit**: 5MB per file
- **Multiple Files**: Supported for products (images array)

### File Upload Endpoints

#### Category Image Upload
```javascript
POST /api/v2/categories
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("name", "Category Name");
formData.append("image", imageFile);
```

#### Brand Logo Upload
```javascript
POST /api/v2/brands
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("name", "Brand Name");
formData.append("logo", logoFile);
```

#### Product Images Upload
```javascript
POST /api/v2/products
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("name", "Product Name");
formData.append("images", imageFile1);
formData.append("images", imageFile2); // Multiple images
```

#### User Avatar Upload
```javascript
PUT /api/v2/users/profile
Content-Type: multipart/form-data

const formData = new FormData();
formData.append("profile[firstName]", "John");
formData.append("avatar", avatarFile);
```

### File Upload Response
```javascript
{
  "success": true,
  "product": {
    "images": [
      {
        "url": "http://localhost:4000/file/file_id",
        "alt": "original_filename.jpg",
        "isPrimary": true,
        "sortOrder": 0
      }
    ]
  }
}
```

## Error Handling

### Common Error Responses

#### Validation Errors
```javascript
{
  "success": false,
  "error": "CategoryV2 validation failed: parentCategory: Cast to ObjectId failed for value \"\" (type string) at path \"parentCategory\""
}
```

#### File Upload Errors
```javascript
{
  "success": false,
  "error": "Failed to upload file image.jpg: Only image files are allowed"
}
```

#### Authentication Errors
```javascript
{
  "success": false,
  "error": "Access denied. Admin privileges required."
}
```

#### Stock Errors
```javascript
{
  "success": false,
  "error": "Insufficient stock for Product Name - SKU-001"
}
```

### Error Handling Best Practices

1. **Always check the `success` field** in responses
2. **Handle file upload errors** gracefully
3. **Validate required fields** before sending requests
4. **Check stock availability** before adding to cart
5. **Handle authentication errors** and redirect to login
6. **Provide user-friendly error messages** based on error types

## Best Practices

### 1. API Usage
- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Include proper headers (Content-Type, Authorization)
- Handle pagination for large datasets
- Use query parameters for filtering and sorting

### 2. Performance
- Implement caching for frequently accessed data
- Use pagination to limit response sizes
- Optimize image uploads (compress before upload)
- Use specific field selection when possible

### 3. Security
- Always validate user input
- Use HTTPS in production
- Implement rate limiting
- Sanitize file uploads

### 4. User Experience
- Provide loading states during API calls
- Handle errors gracefully with user-friendly messages
- Implement optimistic updates where appropriate
- Cache frequently accessed data client-side

