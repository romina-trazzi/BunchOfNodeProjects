const db = require("../models");
const productSchema = require("../validation/productValidation");

exports.createProduct = async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const product = await db.Product.create(req.body);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Errore del server" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await db.Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Errore del server" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    await db.Product.update(req.body, { where: { id: req.params.id } });
    res.json({ message: "Prodotto aggiornato!" });
  } catch (err) {
    res.status(500).json({ error: "Errore del server" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await db.Product.destroy({ where: { id: req.params.id } });
    res.json({ message: "Prodotto eliminato!" });
  } catch (err) {
    res.status(500).json({ error: "Errore del server" });
  }
};
