
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


const btnLogin = document.getElementById("btn-login");

btnLogin?.addEventListener("click", async () => {

    const email = document.getElementById("admin-email").value.trim();
    const senha = document.getElementById("admin-senha").value;

    const erro = document.getElementById("login-error");

    try {

        await signInWithEmailAndPassword(auth, email, senha);

        erro.textContent = "";

    } catch (error) {

        console.error(error);

        erro.textContent = "E-mail ou senha incorretos.";

    }

});


onAuthStateChanged(auth, (usuario) => {

    const loginArea = document.getElementById("login-area");
    const painel = document.getElementById("painel-conteudo");

    if (usuario) {

        loginArea.style.display = "none";
        painel.style.display = "block";

        carregarProdutosFirebaseADM();

    } else {

        loginArea.style.display = "flex";
        painel.style.display = "none";

    }

});

const camposADM = {
    agua: {
        nomeInput: document.querySelector(".Agua input[type='text']"),
        precoInput: document.querySelector("#precoAgua"),
        nomeAtual: document.querySelector("#nome-atual-agua"),
        precoAtual: document.querySelector("#preco-atual-agua"),
        botao: document.querySelector(".Agua .Salvar button")
    },
    gas: {
        nomeInput: document.querySelector(".Gas input[type='text']"),
        precoInput: document.querySelector("#precoGas"),
        nomeAtual: document.querySelector("#nome-atual-gas"),
        precoAtual: document.querySelector("#preco-atual-gas"),
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
        if (!campos.botao) return;

        campos.botao.addEventListener("click", () => {
            salvarProdutoLocal(id);
        });
    });
}

function salvarProdutoLocal(id) {
    const campos = camposADM[id];
    if (!campos) return;

    const produtosADM = JSON.parse(localStorage.getItem("copagazProdutos")) || {};

    const novoNome = campos.nomeInput.value.trim();
    const novoPreco = campos.precoInput.value !== "" ? Number(campos.precoInput.value) : null;

    if (!novoNome && novoPreco === null) {
        alert("Preencha ao menos um campo para alterar.");
        return;
    }

    const produtoAtual = produtosADM[id] || { nome: id === "agua" ? "Água Mineral" : "Gás de cozinha", preco: 0 };

    if (novoNome) produtoAtual.nome = novoNome;
    if (novoPreco !== null && novoPreco >= 0) produtoAtual.preco = novoPreco;

    produtosADM[id] = produtoAtual;

    localStorage.setItem("copagazProdutos", JSON.stringify(produtosADM));

    alert("Alteração salva localmente com sucesso!");
    campos.nomeInput.value = "";
    campos.precoInput.value = "";
    carregarProdutosLocaisADM();
}

function carregarProdutosLocaisADM() {
    const dados = JSON.parse(localStorage.getItem("copagazProdutos")) || {};

    Object.entries(dados).forEach(([id, produto]) => {
        const campos = camposADM[id];
        if (!campos) return;

        if (campos.nomeAtual && produto.nome) campos.nomeAtual.textContent = produto.nome;
        if (campos.precoAtual && produto.preco !== undefined) {
            campos.precoAtual.textContent = Number(produto.produto ? produto.produto : produto.preco).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });
        }
    });
}