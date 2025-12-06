const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());



// Conexão MongoDB - compatível com Render
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB');
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
  });

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal - servir frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Importar rotas
const insumosRoutes = require('./routes/insumos');
const produtosRoutes = require('./routes/produtos');
const vendasRoutes = require('./routes/vendas');

// Usar rotas
app.use('/api/insumos', insumosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/vendas', vendasRoutes);

// Rota de saúde para Render
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor - IMPORTANTE PARA RENDER
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Modo: ${process.env.NODE_ENV || 'development'}`);
});