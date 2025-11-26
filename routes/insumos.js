const express = require('express');
const router = express.Router();
const Insumo = require('../models/insumo');

// GET - Listar todos os insumos
router.get('/', async (req, res) => {
  try {
    const insumos = await Insumo.find();
    res.json(insumos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Criar novo insumo
router.post('/', async (req, res) => {
  const insumo = new Insumo({
    nome: req.body.nome,
    quantidade: req.body.quantidade,
    unidade: req.body.unidade,
    custoUnitario: req.body.custoUnitario,
    minimoEstoque: req.body.minimoEstoque
  });

  try {
    const novoInsumo = await insumo.save();
    res.status(201).json(novoInsumo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - Atualizar insumo
router.put('/:id', async (req, res) => {
  try {
    const insumo = await Insumo.findById(req.params.id);
    if (!insumo) {
      return res.status(404).json({ message: 'Insumo não encontrado' });
    }

    // ATUALIZAÇÃO: Se quantidade for negativa, DECREMENTA o estoque
    if (req.body.quantidade !== undefined) {
      const novaQuantidade = parseFloat(req.body.quantidade);
      
      if (novaQuantidade < 0) {
        // DECREMENTO: quantidade negativa significa consumo
        const quantidadeConsumir = Math.abs(novaQuantidade);
        if (insumo.quantidade < quantidadeConsumir) {
          return res.status(400).json({ 
            message: `Estoque insuficiente! Disponível: ${insumo.quantidade} ${insumo.unidade}, Necessário: ${quantidadeConsumir} ${insumo.unidade}` 
          });
        }
        insumo.quantidade -= quantidadeConsumir;
      } else {
        // SETAR VALOR: quantidade positiva significa definir novo valor
        insumo.quantidade = novaQuantidade;
      }
    }

    // Atualizar outros campos se fornecidos
    if (req.body.nome) insumo.nome = req.body.nome;
    if (req.body.unidade) insumo.unidade = req.body.unidade;
    if (req.body.custoUnitario !== undefined) insumo.custoUnitario = req.body.custoUnitario;
    if (req.body.minimoEstoque !== undefined) insumo.minimoEstoque = req.body.minimoEstoque;

    const insumoAtualizado = await insumo.save();
    res.json(insumoAtualizado);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Adicionar quantidade ao estoque
router.patch('/:id/adicionar', async (req, res) => {
  try {
    const insumo = await Insumo.findById(req.params.id);
    if (!insumo) {
      return res.status(404).json({ message: 'Insumo não encontrado' });
    }

    const quantidadeAdicionar = parseFloat(req.body.quantidade);
    if (quantidadeAdicionar <= 0) {
      return res.status(400).json({ 
        message: 'Quantidade deve ser maior que zero!' 
      });
    }

    insumo.quantidade += quantidadeAdicionar;
    const insumoAtualizado = await insumo.save();
    
    res.json({
      message: `Adicionado ${quantidadeAdicionar} ${insumo.unidade} ao estoque`,
      insumo: insumoAtualizado
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Insumo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Insumo excluído com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;