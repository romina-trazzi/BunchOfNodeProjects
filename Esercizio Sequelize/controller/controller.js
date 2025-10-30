const { Product } = require('../dbconnection');

// CRUD Controller

// Get all products
// exports.getAllProducts = (req, res, next) => {
//     Product.findAll()
//         .then(products => {
//             res.status(200).json({ products: products });
//         })
//         .catch(err => console.log(err));
// }

// Get product by name
// exports.getProductByName = (req, res, next) => {
//     const productName = req.params.productName;
//     Product.findByName(productName)
//         .then(productName => {
//             if (!productName) {
//                 return res.status(404).json({ message: 'Product not found!' });
//             }
//             res.status(200).json({ product: product });
//         })
//         .catch(err => console.log(err));
// }




// Crea un nuovo prodotto (chiamata POST delle routes)
exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    const result = await Product.create({ name, price, stock });

    res.status(201).json({
      message: 'Product created successfully!',
      product: result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};




// Update product
// exports.updateProduct = (req, res, next) => {
//   const productName = req.params.productName;
//   const updatedName = req.body.name;
//   const updatedPrice = req.body.price;
//   const updatedStock = req.body.stock;
  
//   Product.findByName(productName)
//     .then(product => {
//       if (!product) {
//         return res.status(404).json({ message: 'Product not found!' });
//       }
//       product.name = updatedName;
//       product.price = updatedPrice;
//       product.stock = updatedStock;
    
//       return product.save();
//     })
//     .then(result => {
//       res.status(200).json({message: 'Product updated!', product: result});
//     })
//     .catch(err => console.log(err));
// }

// Delete Product
// exports.deleteProduct = (req, res, next) => {
//   const productName = req.params.productName;
//   User.findByName(productName)
//     .then(product => {
//       if (!product) {
//         return res.status(404).json({ message: 'Product not found!' });
//       }
//       return Product.destroy({
//         where: {
//           name: productName
//         }
//       });
//     })
//     .then(result => {
//       res.status(200).json({ message: 'Product deleted!' });
//     })
//     .catch(err => console.log(err));
// }