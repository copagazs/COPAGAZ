// COPAGAZ - main.js

// Preços iniciais. Depois vamos trocar esta parte pelo Firebase.
const produtos = {
    agua: {
        id: "agua",
        nome: "Água Mineral",
        retirada: 12.00,
        entrega: 20.00
    },
    gas: {
        id: "gas",
        nome: "Gás de cozinha",
        retirada: 105.00,
        entrega: 120.00
    }
};

let tipoPedido = localStorage.getItem("copagazTipoPedido") || "retirada";
let carrinho = JSON.parse(localStorage.getItem("copagazCarrinho")) || [];

document.addEventListener("DOMContentLoaded", () => {
    carregarProdutosLocais();
    inicializarCarrinho();

    const botoes = document.querySelectorAll(".ADDcarrinho button");

    botoes.forEach((botao, index) => {
        botao.addEventListener("click", () => {
            adicionarAoCarrinho(index === 0 ? "agua" : "gas");
        });
    });

    atualizarInterface();

    const btnInstalar = document.getElementById("btn-instalar");

    if (btnInstalar) {
        window.addEventListener("beforeinstallprompt", (event) => {
            event.preventDefault();
            installPrompt = event;
            btnInstalar.hidden = false;
        });

        btnInstalar.addEventListener("click", instalarAplicativo);
    }
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
        <div class="carrinho-cabecalho">
            <div>
                <span class="carrinho-legenda">SEU PEDIDO</span>
                <h1>CARRINHO</h1>
            </div>
            <span class="carrinho-contador" id="carrinho-contador">0 itens</span>
        </div>

        <div class="tipo-pedido">
            <span class="tipo-pedido-titulo">Como deseja receber?</span>

            <div class="tipo-opcoes">
                <label class="tipo-opcao">
                    <input type="radio" name="tipo-pedido" value="retirada" ${tipoPedido === "retirada" ? "checked" : ""}>
                    <span>
                        <strong>Retirada no local</strong>
                        <small>Preços de retirada</small>
                    </span>
                </label>

                <label class="tipo-opcao">
                    <input type="radio" name="tipo-pedido" value="entrega" ${tipoPedido === "entrega" ? "checked" : ""}>
                    <span>
                        <strong>Entrega</strong>
                        <small>Preços de entrega</small>
                    </span>
                </label>
            </div>
        </div>

        <div id="lista-carrinho"></div>
        <div id="resumo-carrinho"></div>

        <div class="acoes-carrinho">
            <button type="button" id="limpar-carrinho">Limpar carrinho</button>
            <button type="button" id="finalizar-compra">Finalizar pedido</button>
        </div>
    `;

    document.querySelectorAll('input[name="tipo-pedido"]').forEach((radio) => {
        radio.addEventListener("change", () => {
            tipoPedido = radio.value;
            localStorage.setItem("copagazTipoPedido", tipoPedido);
            atualizarCarrinho();
        });
    });

    document.getElementById("limpar-carrinho")
        ?.addEventListener("click", limparCarrinho);

    document.getElementById("finalizar-compra")
        ?.addEventListener("click", finalizarCompra);
}

function adicionarAoCarrinho(id) {
    const produto = produtos[id];

    if (!produto) return;

    const preco = obterPrecoProduto(produto);

    if (preco <= 0) {
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

function obterPrecoProduto(produto) {
    return tipoPedido === "entrega" ? Number(produto.entrega) : Number(produto.retirada);
}

function calcularTotal() {
    return carrinho.reduce((total, item) => {
        const produto = produtos[item.id];
        return total + obterPrecoProduto(produto) * item.quantidade;
    }, 0);
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
    if (aguaPreco) aguaPreco.textContent = formatarMoeda(obterPrecoProduto(produtos.agua));

    if (gasNome) gasNome.textContent = produtos.gas.nome;
    if (gasPreco) gasPreco.textContent = formatarMoeda(obterPrecoProduto(produtos.gas));

    const legendaPreco = document.querySelector(".produtos-preco-legenda");
    if (legendaPreco) {
        legendaPreco.textContent = tipoPedido === "entrega"
            ? "Preços para entrega"
            : "Preços para retirada no local";
    }
}

function atualizarCarrinho() {
    const lista = document.getElementById("lista-carrinho");
    const resumo = document.getElementById("resumo-carrinho");
    const contador = document.getElementById("carrinho-contador");

    if (!lista || !resumo) return;

    if (contador) {
        const quantidadeTotal = carrinho.reduce((total, item) => total + item.quantidade, 0);
        contador.textContent = `${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"}`;
    }

    if (carrinho.length === 0) {
        lista.innerHTML = `
            <div class="carrinho-vazio">
                <span>🛒</span>
                <p>Seu carrinho está vazio.</p>
                <small>Adicione um produto para começar seu pedido.</small>
            </div>
        `;
    } else {
        lista.innerHTML = carrinho.map(item => {
            const produto = produtos[item.id];
            const preco = obterPrecoProduto(produto);
            const totalItem = preco * item.quantidade;

            return `
                <div class="item-carrinho">
                    <div class="item-info">
                        <h3>${escaparHTML(item.nome)}</h3>
                        <p>${formatarMoeda(preco)} por unidade</p>
                    </div>

                    <div class="item-controles">
                        <div class="quantidade">
                            <button type="button" class="btn-remover" data-id="${item.id}" aria-label="Diminuir quantidade">−</button>
                            <span>${item.quantidade}</span>
                            <button type="button" class="btn-adicionar" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
                        </div>

                        <strong class="item-total">${formatarMoeda(totalItem)}</strong>

                        <button type="button" class="btn-excluir" data-id="${item.id}">Remover</button>
                    </div>
                </div>
            `;
        }).join("");

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

    const total = calcularTotal();

    resumo.innerHTML = `
        <div class="linha-total total-final">
            <span>Total do pedido</span>
            <strong>${formatarMoeda(total)}</strong>
        </div>
    `;

    atualizarProdutosNaTela();
}

function salvarCarrinho() {
    localStorage.setItem("copagazCarrinho", JSON.stringify(carrinho));
}

function finalizarCompra() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    const total = calcularTotal();
    const modalidade = tipoPedido === "entrega"
        ? "entrega"
        : "retirada no local";

    let mensagem = `Olá! Gostaria de fazer um pedido para ${modalidade}:\n\n`;

    carrinho.forEach(item => {
        const produto = produtos[item.id];
        const preco = obterPrecoProduto(produto);
        const totalItem = preco * item.quantidade;

        mensagem += `${item.quantidade}x ${item.nome} - ${formatarMoeda(totalItem)}\n`;
    });

    mensagem += `\nTotal: ${formatarMoeda(total)}`;

    const numeroWhatsApp = "5542999373062";
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

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

    // Compatibilidade com o modelo antigo: preco vira preço de retirada.
    if (Number.isFinite(Number(dados.preco))) {
        produtos[id].retirada = Number(dados.preco);
    }

    if (Number.isFinite(Number(dados.retirada))) {
        produtos[id].retirada = Number(dados.retirada);
    }

    if (Number.isFinite(Number(dados.entrega))) {
        produtos[id].entrega = Number(dados.entrega);
    }

    if (atualizarCarrinho) {
        salvarCarrinho();
        atualizarInterface();
    }
}

let installPrompt = null;

async function instalarAplicativo() {
    const btnInstalar = document.getElementById("btn-instalar");

    if (!installPrompt) {
        alert(
            "Para instalar o COPAGAZ, use o menu do navegador e escolha 'Instalar aplicativo'."
        );
        return;
    }

    installPrompt.prompt();

    const resultado = await installPrompt.userChoice;

    if (resultado.outcome === "accepted") {
        console.log("COPAGAZ instalado!");
    }

    installPrompt = null;

    if (btnInstalar) {
        btnInstalar.hidden = true;
    }
}

window.addEventListener("appinstalled", () => {
    console.log("COPAGAZ instalado!");
});
