# V2 File Upload Implementation Guide

## Overview
File upload functionality has been successfully implemented for V2 product routes. The implementation uses multer middleware and integrates with your existing object storage service running on port 4000.

## Features Implemented

### ✅ Multer Middleware Configuration
- **File Size Limit**: 5MB maximum per file
- **File Type Validation**: Only image files allowed (JPEG, PNG, WebP, etc.)
- **Memory Storage**: Files are stored in memory before upload to object storage
- **Multiple Files**: Support for uploading multiple images at once

### ✅ Centralized Upload Utility
- Uses the existing `src/utils/uploadFile.js` utility
- Includes file validation before upload
- Consistent error handling across all endpoints
- Uses `downloadUrl` from your object storage service

### ✅ Supported Endpoints

#### Product Management
```bash
# Create product with images
POST /api/v2/products
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

# Update product with additional images
PUT /api/v2/products/:id
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>
```

#### Variant Management
```bash
# Create variant with images
POST /api/v2/products/:productId/variants
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

# Update variant with additional images
PUT /api/v2/products/variants/:variantId
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>
```

## Usage Examples

### 1. Create Product with Images
```javascript
const formData = new FormData();
formData.append('name', 'Premium T-Shirt');
formData.append('description', 'High quality cotton t-shirt');
formData.append('pricing[basePrice]', '29.99');
formData.append('categoryId', 'category_id_here');
formData.append('brandId', 'brand_id_here');
formData.append('images', file1); // File object
formData.append('images', file2); // File object

fetch('/api/v2/products', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_admin_token'
  },
  body: formData
});
```

### 2. Create Variant with Images
```javascript
const formData = new FormData();
formData.append('sku', 'TSH-PREM-001-RED-M');
formData.append('colorId', 'red_color_id');
formData.append('sizeId', 'medium_size_id');
formData.append('pricing[basePrice]', '29.99');
formData.append('inventory[stockQuantity]', '50');
formData.append('images', variantImageFile); // File object

fetch('/api/v2/products/product_id/variants', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_admin_token'
  },
  body: formData
});
```

## File Storage Response Format

Your object storage service returns:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "id": "file_id",
    "filename": "generated_filename",
    "originalName": "original_filename.jpg",
    "mimetype": "image/jpeg",
    "size": 12345,
    "uploadDate": "2024-01-01T00:00:00.000Z",
    "downloadUrl": "http://localhost:4000/file/file_id",
    "directUrl": "http://localhost:4000/download/file_id"
  }
}
```

The system uses `downloadUrl` for storing file references in the database.

## Image Storage Structure

### Product Images
```javascript
{
  images: [
    {
      url: "http://localhost:4000/file/file_id",
      alt: "original_filename.jpg",
      isPrimary: true,
      sortOrder: 0
    }
  ]
}
```

### Variant Images
```javascript
{
  images: [
    {
      url: "http://localhost:4000/file/variant_file_id",
      alt: "variant_image.jpg",
      isPrimary: true
    }
  ]
}
```

## Error Handling

The system provides detailed error messages for:
- Invalid file types (non-image files)
- File size exceeding 5MB limit
- Upload failures to object storage
- Missing required fields

Example error response:
```json
{
  "success": false,
  "error": "Failed to upload file image.jpg: Only image files are allowed"
}
```

## Security Features

- **Admin Only**: All file upload endpoints require admin authentication
- **File Type Validation**: Only image files are accepted
- **Size Limits**: 5MB maximum file size
- **Input Validation**: Files are validated before upload

## Testing

To test the file upload functionality:

1. Ensure your object storage service is running on port 4000
2. Use an admin token for authentication
3. Send multipart/form-data requests with image files
4. Verify files are uploaded and URLs are stored correctly

## Migration Notes

- V1 and V2 now have consistent file upload handling
- Both use the same object storage service
- V2 uses the centralized upload utility for better maintainability
- File validation is more robust in V2 implementation


