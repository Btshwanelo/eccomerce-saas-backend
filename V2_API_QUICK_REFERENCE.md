# V2 API Quick Reference

## Base URL
```
http://localhost:8080/api/v2
```

## Authentication
```javascript
// Bearer Token
Authorization: Bearer your_jwt_token

// Guest/Session
x-session-id: session_12345
x-guest-id: guest_67890
```

## Common Headers
```javascript
Content-Type: application/json
Content-Type: multipart/form-data (for file uploads)
Authorization: Bearer token
x-session-id: session_id
x-guest-id: guest_id
```

## Categories

### Create Category
```javascript
// JSON (no image)
POST /api/v2/categories
{
  "name": "Category Name",
  "description": "Description",
  "parentCategory": null, // or parent ID
  "isActive": true,
  "sortOrder": 1
}

// Form Data (with image)
POST /api/v2/categories
Content-Type: multipart/form-data
formData.append("name", "Category Name");
formData.append("image", imageFile);
```

### Get Categories
```javascript
// Flat list
GET /api/v2/categories?page=1&limit=20

// Tree structure
GET /api/v2/categories/tree

// By level
GET /api/v2/categories?level=0

// By parent
GET /api/v2/categories?parentCategory=parent_id

// Search
GET /api/v2/categories?search=query
```

## Products

### Create Product
```javascript
// JSON (no images)
POST /api/v2/products
{
  "name": "Product Name",
  "description": "Description",
  "productType": "simple", // simple, variable, grouped, virtual, downloadable
  "categoryId": "category_id",
  "brandId": "brand_id",
  "pricing": {
    "basePrice": 99.99,
    "currency": "USD"
  },
  "inventory": {
    "stockQuantity": 50,
    "stockStatus": "in_stock"
  }
}

// Form Data (with images)
POST /api/v2/products
Content-Type: multipart/form-data
formData.append("name", "Product Name");
formData.append("images", imageFile1);
formData.append("images", imageFile2);
```

### Get Products
```javascript
// Basic list
GET /api/v2/products?page=1&limit=20

// Filtered
GET /api/v2/products?categoryId=cat&brandId=brand&minPrice=50&maxPrice=200

// Search
GET /api/v2/products/search?search=query&categoryId=cat

// Trending
GET /api/v2/products/trending?limit=10

// New
GET /api/v2/products/new?limit=10

// By slug
GET /api/v2/products/slug/product-slug
```

### Product Variants
```javascript
// Create variant
POST /api/v2/products/{productId}/variants
{
  "sku": "SKU-001-RED-M",
  "colorId": "color_id",
  "sizeId": "size_id",
  "pricing": {
    "basePrice": 29.99
  }
}

// Update variant
PUT /api/v2/products/variants/{variantId}
{
  "pricing": {
    "basePrice": 34.99
  }
}
```

## Cart

### Add to Cart
```javascript
// Simple product
POST /api/v2/cart/add
{
  "productId": "product_id",
  "quantity": 2
}

// Variable product
POST /api/v2/cart/add
{
  "productId": "product_id",
  "variantId": "variant_id",
  "quantity": 1
}
```

### Cart Operations
```javascript
// Get cart
GET /api/v2/cart

// Update item
PUT /api/v2/cart/items/{itemId}
{
  "quantity": 3
}

// Remove item
DELETE /api/v2/cart/items/{itemId}

// Clear cart
DELETE /api/v2/cart/clear

// Apply coupon
POST /api/v2/cart/coupon
{
  "couponCode": "SAVE20"
}

// Remove coupon
DELETE /api/v2/cart/coupon

// Merge carts
POST /api/v2/cart/merge
{
  "sessionId": "session_id"
}
```

## Orders

### Checkout
```javascript
// Initiate checkout
POST /api/v2/orders/checkout/initiate
Headers: {
  'x-session-id': 'session_id'
}

// Complete checkout
POST /api/v2/orders/checkout/complete
{
  "addressId": "address_id",
  "deliveryOptionId": "delivery_id",
  "paymentMethod": "credit_card",
  "notes": "Special instructions"
}
```

### Order Management
```javascript
// Get orders
GET /api/v2/orders?page=1&limit=20&status=pending

// Get order by ID
GET /api/v2/orders/{orderId}
```

## Users

### Authentication
```javascript
// Register
POST /api/v2/users/register
{
  "email": "user@example.com",
  "password": "password123",
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  }
}

// Login
POST /api/v2/users/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Profile Management
```javascript
// Get profile
GET /api/v2/users/profile

// Update profile (JSON)
PUT /api/v2/users/profile
{
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  }
}

// Update profile (with avatar)
PUT /api/v2/users/profile
Content-Type: multipart/form-data
formData.append("profile[firstName]", "John");
formData.append("avatar", avatarFile);
```

### Addresses
```javascript
// Create address
POST /api/v2/addresses
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

// Get addresses
GET /api/v2/addresses
```

## Brands

### Brand Management
```javascript
// Create brand (JSON)
POST /api/v2/brands
{
  "name": "Brand Name",
  "description": "Description",
  "website": "https://brand.com",
  "countryOrigin": "USA",
  "isActive": true
}

// Create brand (with logo)
POST /api/v2/brands
Content-Type: multipart/form-data
formData.append("name", "Brand Name");
formData.append("logo", logoFile);

// Get brands
GET /api/v2/brands?page=1&limit=20

// Get brand by ID
GET /api/v2/brands/{brandId}

// Get brand by slug
GET /api/v2/brands/slug/brand-slug
```

## Attributes

### Colors
```javascript
// Get colors
GET /api/v2/attributes/colors

// Create color
POST /api/v2/attributes/colors
{
  "name": "Red",
  "hexCode": "#FF0000",
  "rgbCode": "rgb(255, 0, 0)",
  "isActive": true
}
```

### Sizes
```javascript
// Get sizes
GET /api/v2/attributes/sizes?category=clothing

// Create size
POST /api/v2/attributes/sizes
{
  "name": "Medium",
  "category": "clothing",
  "numericValue": 10,
  "isActive": true
}
```

### Materials
```javascript
// Get materials
GET /api/v2/attributes/materials

// Create material
POST /api/v2/attributes/materials
{
  "name": "Cotton",
  "description": "100% cotton",
  "composition": [
    {
      "material": "Cotton",
      "percentage": 100
    }
  ],
  "isActive": true
}
```

### Patterns
```javascript
// Get patterns
GET /api/v2/attributes/patterns

// Create pattern (JSON)
POST /api/v2/attributes/patterns
{
  "name": "Floral",
  "description": "Floral pattern",
  "isActive": true
}

// Create pattern (with image)
POST /api/v2/attributes/patterns
Content-Type: multipart/form-data
formData.append("name", "Floral");
formData.append("patternImage", imageFile);
```

## Delivery Options

### Delivery Management
```javascript
// Get delivery options
GET /api/v2/delivery

// Get available options
GET /api/v2/delivery/available?cartTotal=100&weight=2&region=US

// Create delivery option
POST /api/v2/delivery
{
  "name": "Standard Shipping",
  "description": "5-7 business days",
  "cost": 9.99,
  "estimatedDays": {
    "min": 5,
    "max": 7
  },
  "isActive": true
}
```

## File Upload

### Supported File Types
- Images only: JPEG, PNG, WebP, GIF
- Max size: 5MB per file
- Multiple files supported for products

### Upload Endpoints
```javascript
// Category image
POST /api/v2/categories
formData.append("image", imageFile);

// Brand logo
POST /api/v2/brands
formData.append("logo", logoFile);

// Product images
POST /api/v2/products
formData.append("images", imageFile1);
formData.append("images", imageFile2);

// User avatar
PUT /api/v2/users/profile
formData.append("avatar", avatarFile);

// Pattern image
POST /api/v2/attributes/patterns
formData.append("patternImage", imageFile);
```

## Common Query Parameters

### Pagination
```javascript
?page=1&limit=20
```

### Sorting
```javascript
?sort=name          // Sort by name
?sort=-createdAt    // Sort by creation date (desc)
?sort=price-asc     // Sort by price (ascending)
?sort=price-desc    // Sort by price (descending)
?sort=newest        // Sort by newest
?sort=popular       // Sort by popularity
?sort=rating        // Sort by rating
?sort=relevance     // Sort by relevance (search)
```

### Filtering
```javascript
// Basic filters
?categoryId=cat_id
?brandId=brand_id
?minPrice=50
?maxPrice=200
?stockStatus=in_stock

// Array filters
?materialIds[]=mat1&materialIds[]=mat2
?colorIds[]=red&colorIds[]=blue
?sizeIds[]=medium&sizeIds[]=large

// Date filters
?createdAfter=2024-01-01
?createdBefore=2024-12-31

// Search
?search=query
```

## Response Format

### Success Response
```javascript
{
  "success": true,
  "data": {...}, // or specific field names
  "total": 100,  // for paginated responses
  "page": 1,
  "pages": 5
}
```

### Error Response
```javascript
{
  "success": false,
  "error": "Error message"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Common Error Messages

```javascript
// Validation errors
"CategoryV2 validation failed: parentCategory: Cast to ObjectId failed"

// File upload errors
"Failed to upload file: Only image files are allowed"

// Authentication errors
"Access denied. Admin privileges required."

// Stock errors
"Insufficient stock for Product Name"

// Cart errors
"Cart is empty"
"Product not found or not available"

// Order errors
"Address not found"
"Delivery option not available"
```

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Authenticated users: 1000 requests per 15 minutes
- File uploads: 10 requests per 15 minutes

## CORS

- Allowed origins: Configured in environment
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization, x-session-id, x-guest-id
