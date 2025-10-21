const express = require("express");
const productController = require("../controllers/product");

const router = express.Router();

router.post("/", productController.createProduct);
router.get("/", productController.getProducts);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
