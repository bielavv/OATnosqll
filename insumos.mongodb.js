
// 1. Usar/criar o banco de dados
use('sistema-confeiteira');

// 2. Criar collection de INSUMOS com dados iniciais
db.insumos.insertMany([
  {
    nome: "Farinha de Trigo",
    quantidade: 10,
    unidade: "kg",
    custoUnitario: 4.50,
    minimoEstoque: 2,
    dataCriacao: new Date()
  },
  {
    nome: "Açúcar Refinado",
    quantidade: 5,
    unidade: "kg", 
    custoUnitario: 3.80,
    minimoEstoque: 1,
    dataCriacao: new Date()
  },
  {
    nome: "Ovos",
    quantidade: 30,
    unidade: "un",
    custoUnitario: 0.50,
    minimoEstoque: 12,
    dataCriacao: new Date()
  },
  {
    nome: "Chocolate em Pó",
    quantidade: 2,
    unidade: "kg",
    custoUnitario: 12.00,
    minimoEstoque: 0.5,
    dataCriacao: new Date()
  },
  {
    nome: "Manteiga",
    quantidade: 3,
    unidade: "kg",
    custoUnitario: 18.00,
    minimoEstoque: 1,
    dataCriacao: new Date()
  }
]);

// 3. Criar collection de PRODUTOS com dados iniciais
db.produtos.insertMany([
  {
    nome: "Bolo de Chocolate",
    descricao: "Bolo fofinho de chocolate com cobertura",
    preco: 35.00,
    categoria: "Bolos",
    dataCriacao: new Date()
  },
  {
    nome: "Torta de Morango",
    descricao: "Torta com massa amanteigada e recheio de morango",
    preco: 45.00,
    categoria: "Tortas", 
    dataCriacao: new Date()
  },
  {
    nome: "Cupcake de Baunilha",
    descricao: "Cupcake com massa de baunilha e cobertura colorida",
    preco: 8.00,
    categoria: "Cupcakes",
    dataCriacao: new Date()
  },
  {
    nome: "Brigadeiro",
    descricao: "Brigadeiro tradicional em copinho",
    preco: 3.50,
    categoria: "Docinhos",
    dataCriacao: new Date()
  }
]);

// 4. Criar collection de VENDAS (inicialmente vazia)
db.createCollection("vendas");

// 5. VERIFICAR O QUE FOI CRIADO
console.log("🎉 BANCO CRIADO COM SUCESSO!");
console.log("📊 Banco:", db.getName());
console.log("📋 Collections:", db.getCollectionNames());

// 6. MOSTRAR ALGUNS DADOS
console.log("\n📦 INSUMOS CADASTRADOS:");
db.insumos.find().forEach(insumo => {
  console.log(`- ${insumo.nome}: ${insumo.quantidade} ${insumo.unidade}`);
});

console.log("\n🎂 PRODUTOS CADASTRADOS:");
db.produtos.find().forEach(produto => {
  console.log(`- ${produto.nome}: R$ ${produto.preco}`);
});

console.log("\n✅ PRONTO! Agora volte ao VS Code e execute o servidor.");






