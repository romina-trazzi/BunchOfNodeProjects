const controller = require('../controllers/controller');
const router = require('express').Router();

// CRUD Routes /users
router.get('/', controller.getAllProducts); 
router.get('/:productName', controller.getProductByName); 
router.post('/', controller.createProduct);
router.put('/:productName', controller.updateProduct) 
router.delete('/', controller.deleteProduct); 

module.exports = router;