// COPAGAZ - adm.js

const camposADM = {
    agua: {
        nomeInput: document.querySelector(".Agua input[type='text']"),
        retiradaInput: document.querySelector("#precoAguaRetirada"),
        entregaInput: document.querySelector("#precoAguaEntrega"),
        nomeAtual: document.querySelector("#nome-atual-agua"),
        retiradaAtual: document.querySelector("#preco-atual-agua-retirada"),
        entregaAtual: document.querySelector("#preco-atual-agua-entrega"),
        botao: document.querySelector(".Agua .Salvar button")
    },
    gas: {
        nomeInput: document.querySelector(".Gas input[type='text']"),
        retiradaInput: document.querySelector("#precoGasRetirada"),
        entregaInput: document.querySelector("#precoGasEntrega"),
        nomeAtual: document.querySelector("#nome-atual-gas"),
        retiradaAtual: document.querySelector("#preco-atual-gas-retirada"),
        entregaAtual: document.querySelector("#preco-atual-gas-entrega"),
        botao: document.querySelector(".Gas .Salvar button")
    }
};

document.addEventListener("DOMContentLoaded", () => {
    configurarLogin();
    carregarProdutosLocaisADM();
    configurarBotoesADM();
});

function configurarLogin() {
    const btnLogin = document.getElementById("btn-login");
    const loginArea = document.getElementById("login-area");
    const painelConteudo = document.getElementById("painel-conteudo");
    const errorMsg = document.getElementById("login-error");

    btnLogin?.addEventListener("click", () => {
        const email = document.getElementById("admin-email").value;
        const senha = document.getElementById("admin-senha").value;

        if (email === "admin@copagaz.com" && senha === "123456") {
            loginArea.style.display = "none";
            painelConteudo.style.display = "block";
        } else {
            errorMsg.textContent = "E-mail ou senha incorretos!";
        }
    });
}

function configurarBotoesADM() {
    Object.entries(camposADM).forEach(([id, campos]) => {
        campos.botao?.addEventListener("click", () => salvarProdutoLocal(id));
    });
}

function salvarProdutoLocal(id) {
    const campos = camposADM[id];
    if (!campos) return;

    const produtosADM = JSON.parse(localStorage.getItem("copagazProdutos")) || {};

    const novoNome = campos.nomeInput.value.trim();
    const novaRetirada = campos.retiradaInput.value !== ""
        ? Number(campos.retiradaInput.value)
        : null;
    const novaEntrega = campos.entregaInput.value !== ""
        ? Number(campos.entregaInput.value)
        : null;

    if (!novoNome && novaRetirada === null && novaEntrega === null) {
        alert("Preencha ao menos um campo para alterar.");
        return;
    }

    const padrao = id === "agua"
        ? { nome: "Água Mineral", retirada: 12.00, entrega: 20.00 }
        : { nome: "Gás de cozinha", retirada: 105.00, entrega: 120.00 };

    const produtoAtual = produtosADM[id] || { ...padrao };

    if (novoNome) produtoAtual.nome = novoNome;

    if (novaRetirada !== null && novaRetirada >= 0) {
        produtoAtual.retirada = novaRetirada;
    }

    if (novaEntrega !== null && novaEntrega >= 0) {
        produtoAtual.entrega = novaEntrega;
    }

    // Mantém compatibilidade com versões antigas.
    produtoAtual.preco = produtoAtual.retirada;

    produtosADM[id] = produtoAtual;

    localStorage.setItem("copagazProdutos", JSON.stringify(produtosADM));

    alert("Alteração salva localmente com sucesso!");

    campos.nomeInput.value = "";
    campos.retiradaInput.value = "";
    campos.entregaInput.value = "";

    carregarProdutosLocaisADM();
}

function carregarProdutosLocaisADM() {
    const dados = JSON.parse(localStorage.getItem("copagazProdutos")) || {};

    Object.entries(dados).forEach(([id, produto]) => {
        const campos = camposADM[id];
        if (!campos) return;

        const retirada = produto.retirada ?? produto.preco;
        const entrega = produto.entrega ?? produto.preco;

        if (campos.nomeAtual && produto.nome) {
            campos.nomeAtual.textContent = produto.nome;
        }

        if (campos.retiradaAtual && retirada !== undefined) {
            campos.retiradaAtual.textContent = formatarMoeda(retirada);
        }

        if (campos.entregaAtual && entrega !== undefined) {
            campos.entregaAtual.textContent = formatarMoeda(entrega);
        }
    });
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}
