const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function uploadFileFromServer(filePath, filename) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), filename);
  form.append('uploadedBy', 'server-process');

  try {
    const response = await axios.post('http://localhost:4000/upload', form, {
      headers: {
        ...form.getHeaders()
      }
    });

    return response.data.file;
  } catch (error) {
    console.error('Server upload failed:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = uploadFileFromServer;