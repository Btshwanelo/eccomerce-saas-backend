// const axios = require("axios");
// const FormData = require("form-data");
// const fs = require("fs");

// async function uploadFileFromServer(filePath, filename) {
//   const form = new FormData();
//   form.append("file", fs.createReadStream(filePath), filename);
//   form.append("uploadedBy", "server-process");

//   try {
//     const response = await axios.post("http://localhost:4000/upload", form, {
//       headers: {
//         ...form.getHeaders(),
//       },
//     });

//     return response.data.file;
//   } catch (error) {
//     console.error(
//       "Server upload failed:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// }

// module.exports = uploadFileFromServer;

const FormData = require("form-data");
const axios = require("axios");

// Helper function to upload file to external storage
async function uploadFileToStorage(file) {
  const form = new FormData();
  form.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  try {
    const response = await axios.post(process.env.FILE_UPLOAD_URL, form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 30000, // 30 second timeout
    });

    return response.data.file;
  } catch (error) {
    console.error("File upload failed:", error.response?.data || error.message);
    throw new Error("Failed to upload file to storage");
  }
}

// Helper function to upload multiple files
async function uploadMultipleFiles(files) {
  const uploadPromises = files.map((file) => uploadFileToStorage(file));
  return await Promise.all(uploadPromises);
}

// Helper function to validate image files
function validateImageFile(file) {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
  }

  if (file.size > maxSize) {
    throw new Error("File size too large. Maximum size is 5MB.");
  }

  return true;
}

module.exports = {
  uploadFileToStorage,
  uploadMultipleFiles,
  validateImageFile,
};
