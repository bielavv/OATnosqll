const mongoose = require('mongoose');

const insumoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  quantidade: { type: Number, required: true },
  unidade: { type: String, required: true },
  custoUnitario: { type: Number, required: true },
  minimoEstoque: { type: Number, default: 0 }
});

module.exports = mongoose.model('Insumo', insumoSchema);