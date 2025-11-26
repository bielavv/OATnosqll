const express = require('express');
const router = express.Router();
const Produto = require('../models/produto');

// GET 
router.get('/', async (req, res) => {
    try {
        const produtos = await Produto.find()
            .populate('ingredientes.insumo') // Isso é essencial!
            .exec();
        
        console.log('Produtos encontrados:', produtos.length);
        produtos.forEach(produto => {
            console.log(`Produto: ${produto.nome}`);
            console.log('Ingredientes:', produto.ingredientes);
        });
        
        res.json(produtos);
    } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST
router.post('/', async (req, res) => {
    try {
        const produto = new Produto({
            nome: req.body.nome,
            descricao: req.body.descricao,
            preco: req.body.preco,
            categoria: req.body.categoria,
            ingredientes: req.body.ingredientes,
        });

        const novoProduto = await produto.save();
        
        // Popular os dados para retornar completo
        const produtoCompleto = await Produto.findById(novoProduto._id)
            .populate('ingredientes.insumo');
            
        res.status(201).json(produtoCompleto);
    } catch (err) {
        console.error('Erro ao criar produto:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;