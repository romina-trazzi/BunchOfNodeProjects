const Product = require('../models/product');

// CRUD Controller

// Get all products
exports.getAllProducts = (req, res, next) => {
    Product.findAll()
        .then(products => {
            res.status(200).json({ products: products });
        })
        .catch(err => console.log(err));
}

// Get product by name
exports.getProductByName = (req, res, next) => {
    const productName = req.params.productName;
    Product.findByName(productName)
        .then(productName => {
            if (!productName) {
                return res.status(404).json({ message: 'Product not found!' });
            }
            res.status(200).json({ product: product });
        })
        .catch(err => console.log(err));
}

// Create product
exports.createProduct = (req, res, next) => {
  const name = req.body.name;
  const price = req.body.price;
  const stock = req.body.stock
  
  Product.create({
    name: name,
    price: price,
    stock: stock
  })
    .then(result => {
      console.log('Created Product');
      res.status(201).json({
        message: 'Product created successfully!',
        product: result
      });
    })
    .catch(err => {
      console.log(err);
    }); 
}

// Update product
exports.updateProduct = (req, res, next) => {
  const productName = req.params.productName;
  const updatedName = req.body.name;
  const updatedPrice = req.body.price;
  const updatedStock = req.body.stock;
  
  Product.findByName(productName)
    .then(product => {
      if (!product) {
        return res.status(404).json({ message: 'Product not found!' });
      }
      product.name = updatedName;
      product.price = updatedPrice;
      product.stock = updatedStock;
    
      return product.save();
    })
    .then(result => {
      res.status(200).json({message: 'Product updated!', product: result});
    })
    .catch(err => console.log(err));
}

// Delete Product
exports.deleteProduct = (req, res, next) => {
  const productName = req.params.productName;
  User.findByName(productName)
    .then(product => {
      if (!product) {
        return res.status(404).json({ message: 'Product not found!' });
      }
      return Product.destroy({
        where: {
          name: productName
        }
      });
    })
    .then(result => {
      res.status(200).json({ message: 'Product deleted!' });
    })
    .catch(err => console.log(err));
}