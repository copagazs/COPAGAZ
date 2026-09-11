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

// Melissa: o ADM usa o Firebase de verdade, sem senha fixa no código.
let auth = null;
let db = null;

try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (erro) {
    console.error("Erro ao iniciar Firebase:", erro);
    mostrarErro("Não foi possível conectar ao Firebase. Confira a configuração.");
}

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

    if (auth) {
        onAuthStateChanged(auth, (usuario) => {
            const loginArea = document.getElementById("login-area");
            const painel = document.getElementById("painel-conteudo");

            if (usuario) {
                loginArea.style.display = "flex";
                loginArea.style.display = "none";
                painel.style.display = "block";
                carregarProdutosFirebaseADM();
            } else {
                loginArea.style.display = "flex";
                painel.style.display = "none";
            }
        });
    }
});

function mostrarErro(texto) {
    const erro = document.getElementById("login-error");
    if (erro) erro.textContent = texto;
}

function configurarLogin() {
    const btnLogin = document.getElementById("btn-login");

    btnLogin?.addEventListener("click", async () => {
        if (!auth) {
            mostrarErro("Firebase não está conectado.");
            return;
        }

        const email = document.getElementById("admin-email")?.value.trim();
        const senha = document.getElementById("admin-senha")?.value;

        if (!email || !senha) {
            mostrarErro("Digite seu e-mail e sua senha.");
            return;
        }

        btnLogin.disabled = true;
        btnLogin.textContent = "Entrando...";

        try {
            await signInWithEmailAndPassword(auth, email, senha);
            mostrarErro("");
        } catch (error) {
            console.error(error);

            const mensagens = {
                "auth/invalid-credential": "E-mail ou senha incorretos.",
                "auth/invalid-email": "Digite um e-mail válido.",
                "auth/user-not-found": "Usuário não encontrado.",
                "auth/wrong-password": "Senha incorreta.",
                "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde."
            };

            mostrarErro(mensagens[error.code] || "Não foi possível entrar. Verifique o Firebase.");
        } finally {
            btnLogin.disabled = false;
            btnLogin.textContent = "Entrar";
        }
    });

    document.getElementById("admin-senha")?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") btnLogin?.click();
    });
}

function configurarBotoesADM() {
    Object.entries(camposADM).forEach(([id, campos]) => {
        campos.botao?.addEventListener("click", () => salvarProdutoFirebase(id));
    });

    document.getElementById("btn-sair")?.addEventListener("click", () => {
        signOut(auth);
    });
}

async function carregarProdutosFirebaseADM() {
    if (!db) return;

    try {
        for (const id of ["agua", "gas"]) {
            const snap = await getDoc(doc(db, "produtos", id));

            if (snap.exists()) {
                mostrarProdutoADM(id, snap.data());
            }
        }
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        mostrarErro("Entrei no ADM, mas não consegui carregar os produtos.");
    }
}

function mostrarProdutoADM(id, produto) {
    const campos = camposADM[id];
    if (!campos) return;

    if (campos.nomeAtual) {
        campos.nomeAtual.textContent = produto.nome || (id === "agua" ? "Água Mineral" : "Gás de cozinha");
    }

    if (campos.retiradaAtual) {
        campos.retiradaAtual.textContent = formatarMoeda(produto.retirada);
    }

    if (campos.entregaAtual) {
        campos.entregaAtual.textContent = formatarMoeda(produto.entrega);
    }
}

async function salvarProdutoFirebase(id) {
    if (!auth?.currentUser || !db) {
        alert("Faça login no ADM primeiro.");
        return;
    }

    const campos = camposADM[id];
    const nome = campos.nomeInput.value.trim();
    const retiradaTexto = campos.retiradaInput.value;
    const entregaTexto = campos.entregaInput.value;

    const dados = {};

    if (nome) dados.nome = nome;

    if (retiradaTexto !== "") {
        const retirada = Number(retiradaTexto);
        if (!Number.isFinite(retirada) || retirada < 0) {
            alert("Digite um preço de retirada válido.");
            return;
        }
        dados.retirada = retirada;
    }

    if (entregaTexto !== "") {
        const entrega = Number(entregaTexto);
        if (!Number.isFinite(entrega) || entrega < 0) {
            alert("Digite um preço de entrega válido.");
            return;
        }
        dados.entrega = entrega;
    }

    if (Object.keys(dados).length === 0) {
        alert("Preencha pelo menos um campo para alterar.");
        return;
    }

    try {
        campos.botao.disabled = true;
        campos.botao.textContent = "SALVANDO...";

        await setDoc(doc(db, "produtos", id), dados, { merge: true });

        const atualizado = await getDoc(doc(db, "produtos", id));
        if (atualizado.exists()) mostrarProdutoADM(id, atualizado.data());

        campos.nomeInput.value = "";
        campos.retiradaInput.value = "";
        campos.entregaInput.value = "";

        alert("Alteração salva no Firebase! O site público usará os novos valores.");
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Não foi possível salvar. Se o login funcionou, verifique as regras do Firestore.");
    } finally {
        campos.botao.disabled = false;
        campos.botao.textContent = "SALVAR ALTERAÇÕES";
    }
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}
