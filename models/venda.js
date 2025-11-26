const mongoose = require('mongoose');

const vendaSchema = new mongoose.Schema({
  data: { type: Date, default: Date.now },
  produto: { type: String, required: true },
  quantidade: { type: Number, required: true },
  precoUnitario: { type: Number, required: true },
  total: { type: Number, required: true },
  cliente: String
});

module.exports = mongoose.model('Venda', vendaSchema);