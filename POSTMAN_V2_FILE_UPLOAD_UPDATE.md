# V2 Postman Collection - File Upload Update

## 📋 Update Summary

The V2 Postman collection has been comprehensively updated to include file upload functionality for all routes that support it. This update aligns with the backend implementation of file upload capabilities.

## ✅ **Updated Sections**

### **1. Brand Routes**
- ✅ **Create Brand (Admin) - JSON** - Original JSON request
- ✅ **Create Brand with Logo Upload (Admin)** - New file upload request
- ✅ **Update Brand (Admin)** - Original JSON request  
- ✅ **Update Brand with Logo Upload (Admin)** - New file upload request
- ✅ **Delete Brand (Admin)** - Existing request

### **2. Category Routes**
- ✅ **Create Category (Admin) - JSON** - Original JSON request
- ✅ **Create Category with Image Upload (Admin)** - New file upload request
- ✅ **Update Category (Admin)** - Original JSON request
- ✅ **Update Category with Image Upload (Admin)** - New file upload request
- ✅ **Delete Category (Admin)** - New request

### **3. User Management Routes**
- ✅ **Update User Profile - JSON** - Original JSON request
- ✅ **Update User Profile with Avatar Upload** - New file upload request
- ✅ **Get User by ID (Admin)** - New request
- ✅ **Update User (Admin) - JSON** - New JSON request
- ✅ **Update User with Avatar Upload (Admin)** - New file upload request
- ✅ **Delete User (Admin)** - New request

### **4. Pattern Routes (New Section)**
- ✅ **Get Patterns** - New request
- ✅ **Get Pattern by ID** - New request
- ✅ **Get Pattern by Slug** - New request
- ✅ **Create Pattern (Admin) - JSON** - New JSON request
- ✅ **Create Pattern with Image Upload (Admin)** - New file upload request
- ✅ **Update Pattern (Admin)** - New JSON request
- ✅ **Update Pattern with Image Upload (Admin)** - New file upload request
- ✅ **Delete Pattern (Admin)** - New request

### **5. File Upload Examples Section (New)**
- ✅ **File Upload Documentation** - Comprehensive documentation with usage instructions
- ✅ **File Upload Test - Brand Logo** - Test request for brand logo upload
- ✅ **File Upload Test - Category Image** - Test request for category image upload
- ✅ **File Upload Test - User Avatar** - Test request for user avatar upload
- ✅ **File Upload Test - Pattern Image** - Test request for pattern image upload
- ✅ **File Upload Test - Product Images** - Test request for product image upload

## 🔧 **Key Features Added**

### **File Upload Configuration**
- **Content Type**: `multipart/form-data` (automatically set by Postman)
- **File Size Limit**: 5MB per file
- **File Types**: Images only (JPEG, PNG, WebP, etc.)
- **Storage**: Object storage service on port 4000
- **Response**: Returns `downloadUrl` for file access

### **Form Data Structure**
All file upload requests use `form-data` body type with:
- **Text Fields**: Regular form fields for entity data
- **File Fields**: File upload fields with proper field names
- **Nested Objects**: Support for nested object notation (e.g., `profile[firstName]`)

### **Variable Management**
- Added `patternId` variable for pattern-related requests
- Existing variables maintained for backward compatibility
- Auto-population of IDs from successful responses

### **Test Scripts**
- Automatic ID extraction and variable setting
- Response validation for successful uploads
- Error handling for failed uploads

## 📊 **Request Types by Section**

| Section | JSON Requests | File Upload Requests | Total |
|---------|---------------|---------------------|-------|
| Brands | 2 | 2 | 4 |
| Categories | 2 | 2 | 4 |
| Users | 2 | 2 | 4 |
| Patterns | 2 | 2 | 4 |
| File Upload Examples | 0 | 5 | 5 |
| **Total** | **8** | **13** | **21** |

## 🚀 **Usage Instructions**

### **For File Upload Requests:**
1. **Select Request**: Choose any request with "Upload" in the name
2. **Body Tab**: Ensure "form-data" is selected
3. **File Field**: Click on the file field and select an image file
4. **Fill Fields**: Complete other required form fields
5. **Send**: Execute the request

### **For JSON Requests:**
1. **Select Request**: Choose any request with "JSON" in the name
2. **Body Tab**: Ensure "raw" with "application/json" is selected
3. **Edit JSON**: Modify the JSON payload as needed
4. **Send**: Execute the request

### **File Upload Field Names:**
- **Products**: `images` (multiple files)
- **Brands**: `logo` (single file)
- **Categories**: `image` (single file)
- **Users**: `avatar` (single file)
- **Patterns**: `patternImage` (single file)

## 🔒 **Authentication**

All admin requests require:
- **Authorization**: Bearer token in header
- **Role**: Admin privileges
- **Token**: Set in collection variable `{{authToken}}`

## 📝 **Collection Metadata**

- **Name**: Ecommerce SaaS API V2
- **Version**: 2.1.0 (updated from 2.0.0)
- **Description**: Updated to include file upload capabilities
- **Schema**: Postman Collection v2.1.0

## 🎯 **Testing Workflow**

### **Recommended Testing Order:**
1. **Authentication**: Login to get admin token
2. **Create Entities**: Use file upload requests to create entities with images
3. **Update Entities**: Use file upload requests to update existing entities
4. **Verify Uploads**: Check that `downloadUrl` is returned and accessible
5. **Test Examples**: Use the File Upload Examples section for comprehensive testing

### **File Upload Test Examples:**
The collection includes dedicated test requests for each file upload type:
- Brand logo upload test
- Category image upload test
- User avatar upload test
- Pattern image upload test
- Product images upload test

## ✅ **Validation**

- **JSON Syntax**: Validated and error-free
- **Request Structure**: All requests properly formatted
- **Variable References**: All variables correctly referenced
- **File Upload Fields**: Properly configured for multipart/form-data
- **Authentication**: Bearer token authentication maintained

## 🔄 **Backward Compatibility**

- **Existing Requests**: All original JSON requests preserved
- **Variable Names**: Existing variables maintained
- **Request Names**: Clear naming convention (JSON vs Upload)
- **Functionality**: No breaking changes to existing workflows

The V2 Postman collection now provides comprehensive testing capabilities for both traditional JSON API calls and modern file upload functionality, making it easy to test all aspects of the V2 API.


