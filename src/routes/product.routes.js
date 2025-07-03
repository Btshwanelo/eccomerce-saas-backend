const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.array('images'), productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', upload.array('images'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router; 