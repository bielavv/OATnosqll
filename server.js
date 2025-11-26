const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = 'mongodb+srv://gabrielUnexFeira:D%4022bb30@alpha.1ddaizr.mongodb.net/sistema-confeiteira?retryWrites=true&w=majority';

// Conectar ao MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Conectado ao MongoDB');
    console.log('Banco:', mongoose.connection.db.databaseName);
  })
  .catch(err => console.error('❌ Erro ao conectar:', err));

// Servir arquivos estáticos (frontend)
app.use(express.static('public'));

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Sistema da Confeiteira funcionando!' });
});


const insumosRoutes = require('./routes/insumos');
const produtosRoutes = require('./routes/produtos');
const vendasRoutes = require('./routes/vendas');


// Importar rotas
app.use('/api/insumos', insumosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/vendas', vendasRoutes);

// Rota simples de teste da API
app.get('/api/teste', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});