const mongoose = require('mongoose');

const ingredienteSchema = new mongoose.Schema({
  insumo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Insumo', 
    required: true 
  },
  quantidade: { 
    type: Number, 
    required: true 
  },
  unidade: { 
    type: String, 
    required: true 
  }
});

const produtoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: String,
  preco: { type: Number, required: true },
  categoria: String,
  ingredientes: [ingredienteSchema],
}, {
  timestamps: true 
});

module.exports = mongoose.model('Produto', produtoSchema);