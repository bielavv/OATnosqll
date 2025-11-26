const API_URL = 'http://localhost:3000/api';

// Variáveis globais
let insumos = [];
let produtos = [];

// Controle de seções
function mostrarSecao(secao) {
    document.querySelectorAll('.secao').forEach(s => s.classList.remove('ativa'));
    document.getElementById(secao).classList.add('ativa');
    
    // Recarregar dados quando mudar de seção
    if (secao === 'produtos') {
        carregarInsumosParaProdutos();
    }
}

// INSUMOS - Cadastro
document.getElementById('formInsumo').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const insumo = {
        nome: document.getElementById('nomeInsumo').value,
        quantidade: parseFloat(document.getElementById('quantidadeInsumo').value),
        unidade: document.getElementById('unidadeInsumo').value,
        custoUnitario: parseFloat(document.getElementById('custoInsumo').value),
    };

    // Validação
    if (insumo.quantidade < 0) {
        alert('A quantidade não pode ser negativa!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/insumos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(insumo)
        });
        
        if (response.ok) {
            carregarInsumos();
            e.target.reset();
            alert('Insumo cadastrado com sucesso!');
        } else {
            const erro = await response.json();
            alert('Erro: ' + erro.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar insumo.');
    }
});

// Carregar insumos com botões de ação
async function carregarInsumos() {
    try {
        const response = await fetch(`${API_URL}/insumos`);
        insumos = await response.json();
        
        const lista = document.getElementById('listaInsumos');
        lista.innerHTML = insumos.map(insumo => {
            const estoqueBaixo = insumo.quantidade <= (insumo.minimoEstoque || 0);
            const classeEstoque = estoqueBaixo ? 'estoque-baixo' : '';
            
            return `
                <div class="item-lista ${classeEstoque}">
                    <div class="cabecalho-item">
                        <h3>${insumo.nome}</h3>
                        <div class="acoes">
                            <button onclick="abrirModalEditar('${insumo._id}')" class="btn-editar">Editar</button>
                            <button onclick="adicionarEstoque('${insumo._id}')" class="btn-adicionar">Estoque</button>
                            <button onclick="excluirInsumo('${insumo._id}')" class="btn-excluir"> Excluir</button>
                        </div>
                    </div>
                    <div class="info-insumo">
                        <div class="info-item">
                            <span class="label">Estoque:</span>
                            <span class="valor">${insumo.quantidade} ${insumo.unidade}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Custo:</span>
                            <span class="valor">R$ ${insumo.custoUnitario.toFixed(2)}/${insumo.unidade}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Mínimo:</span>
                            <span class="valor">${insumo.minimoEstoque || 0} ${insumo.unidade}</span>
                        </div>
                       
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro:', error);
    }
}

// SISTEMA DE PRODUTOS COM INGREDIENTES
async function carregarInsumosParaProdutos() {
    try {
        const response = await fetch(`${API_URL}/insumos`);
        insumos = await response.json();
        atualizarSelectsInsumos();
    } catch (error) {
        console.error('Erro ao carregar insumos:', error);
    }
}

function atualizarSelectsInsumos() {
    document.querySelectorAll('.select-insumo').forEach(select => {
        const selectedValue = select.value;
        select.innerHTML = '<option value="">Selecione um insumo</option>' +
            insumos.map(insumo => 
                `<option value="${insumo._id}" 
                          data-custo="${insumo.custoUnitario}"
                          data-unidade="${insumo.unidade}">
                    ${insumo.nome} (${insumo.unidade}) - R$ ${insumo.custoUnitario.toFixed(2)}
                </option>`
            ).join('');
        
        // Restaurar valor selecionado se existir
        if (selectedValue) {
            select.value = selectedValue;
            atualizarUnidade(select);
        }
    });
}

function adicionarIngrediente() {
    const template = document.getElementById('templateIngrediente');
    const clone = template.content.cloneNode(true);
    document.getElementById('listaIngredientes').appendChild(clone);
    atualizarSelectsInsumos();
}

function removerIngrediente(botao) {
    botao.closest('.ingrediente-item').remove();
    calcularPreco();
}

function atualizarUnidade(select) {
    const ingredienteItem = select.closest('.ingrediente-item');
    const unidadeSpan = ingredienteItem.querySelector('.unidade-ingrediente');
    const custoSpan = ingredienteItem.querySelector('.custo-ingrediente');
    
    if (select.value) {
        const selectedOption = select.options[select.selectedIndex];
        const unidade = selectedOption.dataset.unidade;
        const custoUnitario = parseFloat(selectedOption.dataset.custo);
        
        unidadeSpan.textContent = unidade;
        
        // Calcular custo deste ingrediente
        const quantidadeInput = ingredienteItem.querySelector('.quantidade-ingrediente');
        const quantidade = parseFloat(quantidadeInput.value) || 0;
        const custo = quantidade * custoUnitario;
        custoSpan.textContent = `R$ ${custo.toFixed(2)}`;
    } else {
        unidadeSpan.textContent = '-';
        custoSpan.textContent = 'R$ 0.00';
    }
    
    calcularPreco();
}

function calcularPreco() {
    let custoTotal = 0;
    
    document.querySelectorAll('.ingrediente-item').forEach(item => {
        const select = item.querySelector('.select-insumo');
        const quantidadeInput = item.querySelector('.quantidade-ingrediente');
        
        if (select.value && quantidadeInput.value) {
            const selectedOption = select.options[select.selectedIndex];
            const custoUnitario = parseFloat(selectedOption.dataset.custo);
            const quantidade = parseFloat(quantidadeInput.value);
            
            custoTotal += custoUnitario * quantidade;
            
            // Atualizar custo do ingrediente
            const custoSpan = item.querySelector('.custo-ingrediente');
            custoSpan.textContent = `R$ ${(custoUnitario * quantidade).toFixed(2)}`;
        }
    });
    
    
    document.getElementById('custoTotal').textContent = custoTotal.toFixed(2);
    
    // Preencher automaticamente o preço final com o sugerido
    const precoFinal = document.getElementById('precoProduto');
    if (!precoFinal.value || precoFinal.value === '0') {
        precoFinal.value = custoTotal.toFixed(2);
    }
}

// PRODUTOS - Cadastro
document.getElementById('formProduto').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Coletar ingredientes
    const ingredientes = [];
    for (const item of document.querySelectorAll('.ingrediente-item')) {
        const select = item.querySelector('.select-insumo');
        const quantidadeInput = item.querySelector('.quantidade-ingrediente');
        
        if (select.value && quantidadeInput.value) {
            ingredientes.push({
                insumo: select.value,
                quantidade: parseFloat(quantidadeInput.value),
                unidade: item.querySelector('.unidade-ingrediente').textContent
            });
        }
    }
    
    if (ingredientes.length === 0) {
        alert('Adicione pelo menos um ingrediente ao produto!');
        return;
    }
    
    const produto = {
        nome: document.getElementById('nomeProduto').value,
        descricao: document.getElementById('descricaoProduto').value,
        preco: parseFloat(document.getElementById('precoProduto').value),
        categoria: document.getElementById('categoriaProduto').value,
        ingredientes: ingredientes,
    };

    try {
        console.log('Cadastrando produto (receita)...', produto);
        
        const response = await fetch(`${API_URL}/produtos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });
        
        if (response.ok) {
            // Apenas cadastra o produto como receita, SEM consumir estoque
            await carregarProdutos();
            
            // Limpar formulário
            e.target.reset();
            document.getElementById('listaIngredientes').innerHTML = '';
            document.getElementById('custoTotal').textContent = '0.00';
            
            alert('Produto cadastrado com sucesso!');
        } else {
            const erro = await response.json();
            alert('❌ Erro: ' + erro.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar produto.');
    }
});

// Elementos do modal
const modal = document.getElementById('modalInsumo');
const spanFechar = document.querySelector('.close');
const formEditar = document.getElementById('formEditarInsumo');
const formAdicionarEstoque = document.getElementById('formAdicionarEstoque');
const btnAdicionarEstoque = document.getElementById('btnAdicionarEstoque');
const btnCancelarAdicionar = document.getElementById('btnCancelarAdicionar');

// Fechar modal
spanFechar.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Abrir modal para editar
function abrirModalEditar(idInsumo) {
    const insumo = insumos.find(i => i._id === idInsumo);
    if (!insumo) return;

    // Preencher formulário de edição
    document.getElementById('editarId').value = insumo._id;
    document.getElementById('editarNome').value = insumo.nome;
    document.getElementById('editarUnidade').value = insumo.unidade;
    document.getElementById('editarCusto').value = insumo.custoUnitario;
    document.getElementById('editarQuantidade').value = insumo.quantidade;

    // Mostrar formulário de edição, esconder de adicionar estoque
    formEditar.style.display = 'block';
    formAdicionarEstoque.style.display = 'none';
    document.getElementById('modalTitulo').textContent = 'Editar Insumo';

    modal.style.display = 'block';
}

// Botão para adicionar estoque
function adicionarEstoque(idInsumo) {
    const insumo = insumos.find(i => i._id === idInsumo);
    if (!insumo) return;

    // Preencher informações para adicionar estoque
    document.getElementById('editarId').value = insumo._id;
    document.getElementById('unidadeAdicionar').textContent = insumo.unidade;

    // Mostrar formulário de adicionar estoque, esconder de edição
    formEditar.style.display = 'none';
    formAdicionarEstoque.style.display = 'block';
    document.getElementById('modalTitulo').textContent = `Adicionar Estoque - ${insumo.nome}`;

    // Limpar campo de quantidade
    document.getElementById('quantidadeAdicionar').value = '';

    modal.style.display = 'block';
}

// Salvar edição do insumo
formEditar.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editarId').value;
    const dadosAtualizados = {
        nome: document.getElementById('editarNome').value,
        unidade: document.getElementById('editarUnidade').value,
        custoUnitario: parseFloat(document.getElementById('editarCusto').value),
        quantidade: parseFloat(document.getElementById('editarQuantidade').value)
    };

    try {
        const response = await fetch(`${API_URL}/insumos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });

        if (response.ok) {
            modal.style.display = 'none';
            carregarInsumos();
            alert('Insumo atualizado com sucesso!');
        } else {
            const erro = await response.json();
            alert('Erro: ' + erro.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar insumo.');
    }
});

// Adicionar quantidade ao estoque
formAdicionarEstoque.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editarId').value;
    const quantidade = parseFloat(document.getElementById('quantidadeAdicionar').value);

    try {
        const response = await fetch(`${API_URL}/insumos/${id}/adicionar`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantidade: quantidade })
        });

        if (response.ok) {
            modal.style.display = 'none';
            carregarInsumos();
            const resultado = await response.json();
            alert(resultado.message);
        } else {
            const erro = await response.json();
            alert('Erro: ' + erro.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao adicionar estoque.');
    }
});

// Cancelar adição de estoque
btnCancelarAdicionar.addEventListener('click', () => {
    formAdicionarEstoque.style.display = 'none';
    formEditar.style.display = 'block';
    modal.style.display = 'none';
});

// Alternar para formulário de adicionar estoque
btnAdicionarEstoque.addEventListener('click', () => {
    formEditar.style.display = 'none';
    formAdicionarEstoque.style.display = 'block';
    document.getElementById('modalTitulo').textContent = 'Adicionar ao Estoque';
});

// Excluir insumo
async function excluirInsumo(id) {
    if (confirm('Tem certeza que deseja excluir este insumo?')) {
        try {
            const response = await fetch(`${API_URL}/insumos/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                carregarInsumos();
                alert('Insumo excluído com sucesso!');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao excluir insumo.');
        }
    }
}

// Modifique a função de criar produto para validar estoque
document.getElementById('formProduto').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Coletar ingredientes
    const ingredientes = [];
    let estoqueInsuficiente = false;
    let mensagemErro = '';

    // Validar estoque antes de enviar
    for (const item of document.querySelectorAll('.ingrediente-item')) {
        const select = item.querySelector('.select-insumo');
        const quantidadeInput = item.querySelector('.quantidade-ingrediente');
        
        if (select.value && quantidadeInput.value) {
            const insumoId = select.value;
            const quantidadeNecessaria = parseFloat(quantidadeInput.value);
            const insumo = insumos.find(i => i._id === insumoId);
            
            if (insumo && insumo.quantidade < quantidadeNecessaria) {
                estoqueInsuficiente = true;
                mensagemErro = `Estoque insuficiente de ${insumo.nome}. Disponível: ${insumo.quantidade} ${insumo.unidade}, Necessário: ${quantidadeNecessaria} ${insumo.unidade}`;
                break;
            }
            
            ingredientes.push({
                insumo: insumoId,
                quantidade: quantidadeNecessaria,
                unidade: item.querySelector('.unidade-ingrediente').textContent
            });
        }
    }
    
    if (estoqueInsuficiente) {
        alert('❌ ' + mensagemErro);
        return;
    }
    
    if (ingredientes.length === 0) {
        alert('Adicione pelo menos um ingrediente ao produto!');
        return;
    }
    
    // ... resto do código do produto (igual ao anterior)
});

// Carregar produtos 
async function carregarProdutos() {
    try {
        const response = await fetch(`${API_URL}/produtos`);
        produtos = await response.json();
        
        const lista = document.getElementById('listaProdutos');
        lista.innerHTML = produtos.map(produto => `
            <div class="item-lista produto-card">
                <h3>${produto.nome}</h3>
                <p class="descricao">${produto.descricao || 'Sem descrição'}</p>
                <div class="info-produto">
                    <span class="preco">R$ ${produto.preco.toFixed(2)}</span>
                    <span class="categoria">${produto.categoria || 'Sem categoria'}</span>
                </div>
                <div class="ingredientes-lista">
                    <strong>Ingredientes:</strong>
                    ${produto.ingredientes && produto.ingredientes.length > 0 ? 
                      produto.ingredientes.map(ing => 
                       
                `<span class="ingrediente">${ing.insumo.nome}: ${ing.quantidade} ${ing.unidade}</span>`
                      ).join('') : 
                      '<span>Nenhum ingrediente</span>'
                    }
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

// VENDAS - Registrar venda e consumir estoque
document.getElementById('formVenda').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const produtoSelect = document.getElementById('produtoVenda');
    const produtoId = produtoSelect.value;
    const quantidade = parseInt(document.getElementById('quantidadeVenda').value);
    const cliente = document.getElementById('clienteVenda').value;

    if (!produtoId) {
        alert('Por favor, selecione um produto!');
        return;
    }

    const vendaData = {
        produtoId: produtoId,
        quantidade: quantidade,
        cliente: cliente
    };

    try {
        console.log('Registrando venda...', vendaData);
        
        const response = await fetch(`${API_URL}/vendas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vendaData)
        });
        
        if (response.ok) {
            // Atualizar listas após venda
            await carregarVendas();
            await carregarInsumos(); // Atualiza estoque
            
            e.target.reset();
            alert('Venda registrada com sucesso');
        } else {
            const erro = await response.json();
            alert('❌ Erro: ' + erro.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao registrar venda.');
    }
});

//LISTAR VENDAS
async function carregarVendas() {
    try {
        const response = await fetch(`${API_URL}/vendas`);
        const vendas = await response.json();
        
        const lista = document.getElementById('listaVendas');
        lista.innerHTML = vendas.map(venda => `
            <div class="item-lista">
                <h3>Venda - ${new Date(venda.data).toLocaleDateString()}</h3>
                <p>Produto: ${venda.produto}</p>
                <p>Quantidade: ${venda.quantidade}</p>
                <p>Total: R$ ${venda.total.toFixed(2)}</p>
                <p>Cliente: ${venda.cliente || 'Não informado'}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Carregar produtos para o select de vendas
async function carregarProdutosParaVendas() {
    try {
        const response = await fetch(`${API_URL}/produtos`);
        const produtos = await response.json();
        
        const select = document.getElementById('produtoVenda');
        select.innerHTML = '<option value="">Selecione um produto</option>';
        
        produtos.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto._id; // Envia o ID para o backend
            option.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos para vendas:', error);
    }
}

// BALANÇO POR PERÍODO
async function carregarBalanco() {
    try {
        const response = await fetch(`${API_URL}/vendas`);
        const vendas = await response.json();
        
        const mesSelecionado = document.getElementById('mesBalanco').value;
        const [ano, mes] = mesSelecionado.split('-');
        
        const vendasMes = vendas.filter(venda => {
            const dataVenda = new Date(venda.data);
            return dataVenda.getFullYear() == ano && 
                   (dataVenda.getMonth() + 1) == mes;
        });
        
        const totalVendas = vendasMes.reduce((sum, v) => sum + v.total, 0);
        
        document.getElementById('resultadoBalanco').innerHTML = `
            <h3>Balanço do Mês ${mes}/${ano}</h3>
            <p>Total de Vendas: R$ ${totalVendas.toFixed(2)}</p>
            <p>Número de Vendas: ${vendasMes.length}</p>
            <p>Ticket Médio: R$ ${(totalVendas / (vendasMes.length || 1)).toFixed(2)}</p>
        `;
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarInsumos();
    carregarProdutos();
    carregarVendas();
    carregarInsumosParaProdutos();
    carregarProdutosParaVendas();

});
