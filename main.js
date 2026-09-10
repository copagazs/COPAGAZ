// COPAGAZ - main.js
const TAXA_ENTREGA = 20.00;

const produtos = {
    agua: { id: "agua", nome: "Água Mineral", preco: 100.00 },
    gas: { id: "gas", nome: "Gás de cozinha", preco: 120.00 }
};

let carrinho = JSON.parse(localStorage.getItem("copagazCarrinho")) || [];

document.addEventListener("DOMContentLoaded", () => {
    carregarProdutosLocais();
    inicializarCarrinho();
    atualizarInterface();

    const botoes = document.querySelectorAll(".ADDcarrinho button");

    botoes.forEach((botao, index) => {
        botao.addEventListener("click", () => {
            adicionarAoCarrinho(index === 0 ? "agua" : "gas");
        });
    });
});

function carregarProdutosLocais() {
    const dados = JSON.parse(localStorage.getItem("copagazProdutos")) || {};

    Object.entries(dados).forEach(([id, produto]) => {
        atualizarProduto(id, produto, false);
    });
}

function inicializarCarrinho() {
    const carrinhoElemento = document.querySelector(".Carrinho");
    if (!carrinhoElemento) return;

    carrinhoElemento.innerHTML = `
        <h1>CARRINHO</h1>
        <div id="lista-carrinho"></div>
        <div id="resumo-carrinho"></div>
        <div class="acoes-carrinho">
            <button type="button" id="limpar-carrinho">Limpar carrinho</button>
            <button type="button" id="finalizar-compra">Finalizar compra</button>
        </div>
    `;

    document.getElementById("limpar-carrinho")
        ?.addEventListener("click", limparCarrinho);

    document.getElementById("finalizar-compra")
        ?.addEventListener("click", finalizarCompra);
}

function adicionarAoCarrinho(id) {
    const produto = produtos[id];

    if (!produto || produto.preco <= 0) {
        alert("O preço deste produto ainda não foi configurado.");
        return;
    }

    const existente = carrinho.find(item => item.id === id);

    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({
            id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: 1
        });
    }

    salvarCarrinho();
    atualizarInterface();
}

function removerDoCarrinho(id) {
    const item = carrinho.find(item => item.id === id);
    if (!item) return;

    if (item.quantidade > 1) {
        item.quantidade -= 1;
    } else {
        carrinho = carrinho.filter(item => item.id !== id);
    }

    salvarCarrinho();
    atualizarInterface();
}

function removerProdutoCompletamente(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    salvarCarrinho();
    atualizarInterface();
}

function limparCarrinho() {
    carrinho = [];
    salvarCarrinho();
    atualizarInterface();
}

function calcularSubtotal() {
    return carrinho.reduce(
        (total, item) => total + item.preco * item.quantidade,
        0
    );
}

function calcularEntrega() {
    return carrinho.length > 0 ? TAXA_ENTREGA : 20.00;
}

function calcularTotal() {
    return calcularSubtotal() + calcularEntrega();
}

function atualizarInterface() {
    atualizarProdutosNaTela();
    atualizarCarrinho();
}

function atualizarProdutosNaTela() {
    const aguaNome = document.querySelector(".Agua h2");
    const aguaPreco = document.querySelector(".Agua .preco p");
    const gasNome = document.querySelector(".Gas h2");
    const gasPreco = document.querySelector(".Gas .preco p");

    if (aguaNome) aguaNome.textContent = produtos.agua.nome;
    if (aguaPreco) aguaPreco.textContent = formatarMoeda(produtos.agua.preco);

    if (gasNome) gasNome.textContent = produtos.gas.nome;
    if (gasPreco) gasPreco.textContent = formatarMoeda(produtos.gas.preco);
}

function atualizarCarrinho() {
    const lista = document.getElementById("lista-carrinho");
    const resumo = document.getElementById("resumo-carrinho");

    if (!lista || !resumo) return;

    if (carrinho.length === 0) {
        lista.innerHTML = `<p class="carrinho-vazio">Seu carrinho está vazio.</p>`;
    } else {
        lista.innerHTML = carrinho.map(item => `
            <div class="item-carrinho">
                <div class="item-info">
                    <h3>${escaparHTML(item.nome)}</h3>
                    <p>${formatarMoeda(item.preco)} cada</p>
                </div>

                <div class="item-controles">
                    <button type="button" class="btn-remover" data-id="${item.id}">−</button>
                    <span>${item.quantidade}</span>
                    <button type="button" class="btn-adicionar" data-id="${item.id}">+</button>
                    <strong>${formatarMoeda(item.preco * item.quantidade)}</strong>
                    <button type="button" class="btn-excluir" data-id="${item.id}">Remover</button>
                </div>
            </div>
        `).join("");

        lista.querySelectorAll(".btn-remover").forEach(botao => {
            botao.addEventListener("click", () => removerDoCarrinho(botao.dataset.id));
        });

        lista.querySelectorAll(".btn-adicionar").forEach(botao => {
            botao.addEventListener("click", () => adicionarAoCarrinho(botao.dataset.id));
        });

        lista.querySelectorAll(".btn-excluir").forEach(botao => {
            botao.addEventListener("click", () =>
                removerProdutoCompletamente(botao.dataset.id)
            );
        });
    }

    const subtotal = calcularSubtotal();
    const entrega = calcularEntrega();
    const total = calcularTotal();

    resumo.innerHTML = `
        <div class="linha-total">
            <span>Subtotal:</span>
            <strong>${formatarMoeda(subtotal)}</strong>
        </div>
        <div class="linha-total">
            <span>Entrega:</span>
            <strong>${formatarMoeda(entrega)}</strong>
        </div>
        <div class="linha-total total-final">
            <span>Total:</span>
            <strong>${formatarMoeda(total)}</strong>
        </div>
    `;
}

function salvarCarrinho() {
    localStorage.setItem("copagazCarrinho", JSON.stringify(carrinho));
}

function finalizarCompra() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    const subtotal = calcularSubtotal();
    const entrega = calcularEntrega();
    const total = calcularTotal();

    let mensagem = "Olá! Gostaria de fazer um pedido:\n\n";

    carrinho.forEach(item => {
        mensagem += `${item.quantidade}x ${item.nome} - ${formatarMoeda(item.preco * item.quantidade)}\n`;
    });

    mensagem += `\nSubtotal: ${formatarMoeda(subtotal)}`;
    mensagem += `\nEntrega: ${formatarMoeda(entrega)}`;
    mensagem += `\nTotal: ${formatarMoeda(total)}`;

    const numeroWhatsApp = "5542999373062";
    const url = `https://wa.me/5542999373062?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank");
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

function atualizarProduto(id, dados, atualizarCarrinho = true) {
    if (!produtos[id]) return;

    if (typeof dados.nome === "string" && dados.nome.trim()) {
        produtos[id].nome = dados.nome.trim();
    }

    if (Number.isFinite(Number(dados.preco))) {
        produtos[id].preco = Number(dados.preco);
    }

    if (atualizarCarrinho) {
        carrinho.forEach(item => {
            if (item.id === id) {
                item.nome = produtos[id].nome;
                item.preco = produtos[id].preco;
            }
        });
        salvarCarrinho();
        atualizarInterface();
    }
}
