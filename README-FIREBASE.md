# COPAGAZ + Firebase

## O que já foi preparado
- Login do ADM com Firebase Authentication (e-mail e senha).
- Produtos salvos no Cloud Firestore.
- Água: retirada e entrega separados.
- Gás: retirada e entrega separados.
- O site público lê os preços do Firestore.
- O ADM salva alterações no Firestore.
- O site mantém os preços padrão atuais caso o Firebase ainda não esteja configurado.

## 1. Criar o projeto
No Firebase Console, crie um projeto para o COPAGAZ.

## 2. Authentication
Em Authentication > Sign-in method, ative "E-mail/senha".
Depois, em Users, crie o usuário que terá acesso ao ADM.

O usuário NÃO precisa ter senha escrita no código. A senha fica no Firebase Authentication.

## 3. Web App
Em Configurações do projeto > Seus apps, adicione um aplicativo da Web.
Copie o objeto `firebaseConfig` e cole os valores em `firebase-config.js`.

## 4. Firestore
Crie o Cloud Firestore.
Depois, crie a coleção:
`produtos`

Crie estes dois documentos:

`produtos/agua`
- nome: "Água Mineral"
- retirada: 12
- entrega: 20

`produtos/gas`
- nome: "Gás de cozinha"
- retirada: 105
- entrega: 120

## 5. Segurança do ADM
Abra Authentication > Users, copie o UID do usuário administrador.
No arquivo `firestore.rules`, troque:
`SEU_UID_DE_ADMIN`
pelo UID real.

Depois publique as regras no Firestore.

Isso faz com que:
- qualquer pessoa possa LER os preços;
- somente o usuário cujo UID está na regra possa ALTERAR os preços.

## 6. Teste
Abra `adm.html` por um servidor local/hosting (não pelo `file://`).
Entre com o e-mail e senha cadastrados no Firebase.
Altere um preço e salve.
Depois abra o `index.html`: o site deverá buscar o novo valor do Firestore.

## Importante
Antes de publicar, preencha `firebase-config.js` com o config do SEU projeto.
Não coloque senhas ou chaves privadas nesse arquivo.
