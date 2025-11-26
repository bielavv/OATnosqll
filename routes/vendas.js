const express = require('express');
const router = express.Router();
const Venda = require('../models/venda');
const Produto = require('../models/produto');
const Insumo = require('../models/insumo');

// GET - Listar todas as vendas
router.get('/', async (req, res) => {
  try {
    const vendas = await Venda.find();
    res.json(vendas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Criar nova venda e consumir estoque
router.post('/', async (req, res) => {
  try {
    const { produtoId, quantidade, cliente } = req.body;

    // Buscar o produto para obter os ingredientes
    const produto = await Produto.findById(produtoId).populate('ingredientes.insumo');
    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Validar estoque antes de vender
    for (const ingrediente of produto.ingredientes) {
      const insumo = await Insumo.findById(ingrediente.insumo._id);
      if (!insumo) {
        return res.status(400).json({ 
          message: `Insumo ${ingrediente.insumo.nome} não encontrado` 
        });
      }

      const quantidadeNecessaria = ingrediente.quantidade * quantidade;
      if (insumo.quantidade < quantidadeNecessaria) {
        return res.status(400).json({ 
          message: `Estoque insuficiente de ${insumo.nome}. Disponível: ${insumo.quantidade} ${insumo.unidade}, Necessário: ${quantidadeNecessaria} ${insumo.unidade}` 
        });
      }
    }

    // Consumir estoque dos ingredientes
    for (const ingrediente of produto.ingredientes) {
      const insumo = await Insumo.findById(ingrediente.insumo._id);
      const quantidadeNecessaria = ingrediente.quantidade * quantidade;
      
      insumo.quantidade -= quantidadeNecessaria;
      await insumo.save();
    }

    // Calcular total
    const total = produto.preco * quantidade;

    // Criar a venda
    const venda = new Venda({
      produto: produto.nome,
      quantidade: quantidade,
      precoUnitario: produto.preco,
      total: total,
      cliente: cliente
    });

    const novaVenda = await venda.save();
    res.status(201).json(novaVenda);

  } catch (err) {
    console.error('Erro ao registrar venda:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;