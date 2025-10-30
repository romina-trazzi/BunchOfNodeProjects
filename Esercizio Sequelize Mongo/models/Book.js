import mongoose from 'mongoose';
const { Schema } = mongoose;


// Definisci lo schema per i libri
const bookSchema = new Schema({
  title: String, // String is shorthand for {type: String}
  author: String,
  year: Number,
});

// Crea il modello per i libri
const Book = mongoose.model('Book', bookSchema);

export default Book;