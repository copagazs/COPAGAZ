// COPAGAZ - adm.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import firebaseConfig from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const camposADM = {
    agua: {
        nomeInput: document.querySelector(".Agua input[type='text']"),
        retiradaInput: document.querySelector("#retiradaAgua"),
        entregaInput: document.querySelector("#entregaAgua"),
        nomeAtual: document.querySelector("#nome-atual-agua"),
        retiradaAtual: document.querySelector("#retirada-atual-agua"),
        entregaAtual: document.querySelector("#entrega-atual-agua"),
        botao: document.querySelector(".Agua .Salvar button")
    },
    gas: {
        nomeInput: document.querySelector(".Gas input[type='text']"),
        retiradaInput: document.querySelector("#retiradaGas"),
        entregaInput: document.querySelector("#entregaGas"),
        nomeAtual: document.querySelector("#nome-atual-gas"),
        retiradaAtual: document.querySelector("#retirada-atual-gas"),
        entregaAtual: document.querySelector("#entrega-atual-gas"),
        botao: document.querySelector(".Gas .Salvar button")
    }
};

document.addEventListener("DOMContentLoaded", () => {
    configurarLogin();
    configurarBotoesADM();
});

function configurarLogin() {
    const btnLogin = document.getElementById("btn-login");
    const loginArea = document.getElementById("login-area");
    const painelConteudo = document.getElementById("painel-conteudo");
    const errorMsg = document.getElementById("login-error");

    btnLogin?.addEventListener("click", async () => {
        errorMsg.textContent = "";
        const email = document.getElementById("admin-email").value.trim();
        const senha = document.getElementById("admin-senha").value;

        if (!email || !senha) {
            errorMsg.textContent = "Digite o e-mail e a senha.";
            return;
        }

        btnLogin.disabled = true;
        btnLogin.textContent = "Entrando...";

        try {
            await signInWithEmailAndPassword(auth, email, senha);
        } catch (erro) {
            console.error(erro);
            errorMsg.textContent = mensagemErroLogin(erro.code);
        } finally {
            btnLogin.disabled = false;
            btnLogin.textContent = "Entrar";
        }
    });

    onAuthStateChanged(auth, async (usuario) => {
        if (usuario) {
            loginArea.style.display = "none";
            painelConteudo.style.display = "block";
            await carregarProdutosFirebase();
        } else {
            loginArea.style.display = "flex";
            painelConteudo.style.display = "none";
        }
    });
}

function mensagemErroLogin(codigo) {
    if (codigo === "auth/invalid-credential") return "E-mail ou senha incorretos.";
    if (codigo === "auth/user-not-found") return "Usuário não encontrado.";
    if (codigo === "auth/wrong-password") return "E-mail ou senha incorretos.";
    if (codigo === "auth/too-many-requests") return "Muitas tentativas. Tente novamente mais tarde.";
    return "Não foi possível entrar. Confira seus dados.";
}

function configurarBotoesADM() {
    Object.entries(camposADM).forEach(([id, campos]) => {
        campos.botao?.addEventListener("click", () => salvarProdutoFirebase(id));
    });
}

async function carregarProdutosFirebase() {
    try {
        for (const id of Object.keys(camposADM)) {
            const snap = await getDoc(doc(db, "produtos", id));
            if (!snap.exists()) continue;

            const produto = snap.data();
            const campos = camposADM[id];

            if (produto.nome) campos.nomeAtual.textContent = produto.nome;
            if (produto.retirada !== undefined) campos.retiradaAtual.textContent = formatarMoeda(produto.retirada);
            if (produto.entrega !== undefined) campos.entregaAtual.textContent = formatarMoeda(produto.entrega);
        }
    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
        document.getElementById("login-error").textContent = "Não foi possível carregar os produtos.";
    }
}

async function salvarProdutoFirebase(id) {
    const campos = camposADM[id];
    if (!campos || !auth.currentUser) return;

    const nome = campos.nomeInput.value.trim();
    const retiradaTexto = campos.retiradaInput.value.trim();
    const entregaTexto = campos.entregaInput.value.trim();

    const dados = {};

    if (nome) dados.nome = nome;

    if (retiradaTexto !== "") {
        const valor = Number(retiradaTexto);
        if (!Number.isFinite(valor) || valor < 0) {
            alert("Digite um valor válido para a retirada.");
            return;
        }
        dados.retirada = valor;
    }

    if (entregaTexto !== "") {
        const valor = Number(entregaTexto);
        if (!Number.isFinite(valor) || valor < 0) {
            alert("Digite um valor válido para a entrega.");
            return;
        }
        dados.entrega = valor;
    }

    if (!Object.keys(dados).length) {
        alert("Preencha ao menos um campo para alterar.");
        return;
    }

    try {
        campos.botao.disabled = true;
        campos.botao.textContent = "SALVANDO...";

        await setDoc(doc(db, "produtos", id), dados, { merge: true });

        alert("Alterações salvas no Firebase com sucesso!");
        campos.nomeInput.value = "";
        campos.retiradaInput.value = "";
        campos.entregaInput.value = "";

        await carregarProdutosFirebase();
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível salvar. Verifique as regras do Firestore.");
    } finally {
        campos.botao.disabled = false;
        campos.botao.textContent = "SALVAR ALTERAÇÕES";
    }
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Permite usar Ctrl+Enter no formulário como atalho.
document.addEventListener("keydown", event => {
    if (event.ctrlKey && event.key === "Enter") {
        document.querySelector(".painel .Salvar button")?.click();
    }
});
