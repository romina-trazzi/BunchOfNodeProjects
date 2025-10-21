// src/models/index.js
// Scopo: importare TUTTI i model e definire QUI le associazioni tra loro.
// Importante: importa questo file nell'entrypoint (src/index.js) PRIMA di initDB()
// così, se usi sequelize.sync in dev, conosce già tutte le relazioni/tabelle.

import User from './User.js';
import Task from './Task.js';

import Product from './Product.js';
import Category from './Category.js';
import ProductCategory from './ProductCategory.js'; // tabella ponte N:M Product<->Category

import UserMovie from './UserMovie.js';
import Movie from './Movie.js';
import User from './User.js';         // tabella ponte N:M User<->Movie con campi extra

/* =========================
   User ↔ Task (1 : N)
   - Un utente ha molte task.
   - Ogni task appartiene a un utente (FK userId non nulla).
   - Se elimini un utente, elimini a cascata le sue task (CASCADE).
========================= */
User.hasMany(Task, {
  foreignKey: { name: 'userId', allowNull: false },
  as: 'tasks',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Task.belongsTo(User, {
  foreignKey: { name: 'userId', allowNull: false },
  as: 'user'
});

/* =========================
   Product ↔ Category (N : M)
   - Un prodotto può avere più categorie; una categoria può avere più prodotti.
   - Usiamo la tabella ponte ProductCategory.
   - OnDelete CASCADE: se elimini prodotto/categoria, rimuovi i link corrispondenti.
========================= */
Product.belongsToMany(Category, {
  through: ProductCategory,
  foreignKey: 'productId',
  otherKey: 'categoryId',
  as: 'categories',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Category.belongsToMany(Product, {
  through: ProductCategory,
  foreignKey: 'categoryId',
  otherKey: 'productId',
  as: 'products',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

/* =========================
   User ↔ Movie (N : M) via UserMovie
   - Relazione molti-a-molti con attributi extra (favorite, watchlist, rating, notes).
   - Un record per coppia (userId, movieId) (vincolo unico definito nel model).
   - CASCADE per pulire le righe ponte se elimini user o movie.
========================= */
User.belongsToMany(Movie, {
  through: UserMovie,
  foreignKey: 'userId',
  otherKey: 'movieId',
  as: 'movies',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Movie.belongsToMany(User, {
  through: UserMovie,
  foreignKey: 'movieId',
  otherKey: 'userId',
  as: 'users',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

UserMovie.belongsTo(Movie, { foreignKey: 'movieId' });
UserMovie.belongsTo(User,  { foreignKey: 'userId'  });

// (Opzionale, comodi se vuoi risalire da Movie/User ai pivot dell'utente)
Movie.hasMany(UserMovie, { foreignKey: 'movieId', as: 'userLinks', onDelete: 'CASCADE' });
User.hasMany(UserMovie,  { foreignKey: 'userId',  as: 'movieLinks', onDelete: 'CASCADE' });

// (Opzionale) alias comodi: permettono include annidati più leggibili.
// Esempi uso in query:
//   User.findByPk(id, { include: [{ model: Task, as: 'tasks' }] });
//   Product.findByPk(id, { include: [{ model: Category, as: 'categories' }] });
//   User.findByPk(id, { include: [{ model: Movie, as: 'movies' }] });

export {
  User,
  Task,
  Product,
  Category,
  ProductCategory,
  Movie,
  UserMovie
};