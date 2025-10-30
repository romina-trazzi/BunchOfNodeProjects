const controller = require('../controller/controller');
const router = require('express').Router();

// CRUD Product routes

// Crea e inserisce nel db un nuovo prodotto
router.post('/', controller.createProduct);




// router.get('/', controller.getAllProducts); 
// router.get('/:productName', controller.getProductByName); 
// router.put('/:productName', controller.updateProduct) 
// router.delete('/', controller.deleteProduct); 

module.exports = router;