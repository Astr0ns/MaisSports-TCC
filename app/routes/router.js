var express = require("express");
var router = express.Router();
exports.router = router;
const connection = require("../../config/pool_conexoes");
const req = require("express/lib/request");
const flash = require("connect-flash");
const bcrypt = require('bcrypt');

router.get("/", function (req, res) {
    var email = req.session.email;
    req.session.email;
    res.render("pages/index", { email: email });
});

router.get("/login", function (req, res) {
    res.render("pages/login");
});
router.get("/locais-esportivos", function (req, res) {
    var email = req.session.email;
    res.render("pages/locais-esportivos", { email: email });
});
router.get("/product-page", function (req, res) {
    var email = req.session.email;
    res.render("pages/product-page", { email: email });
});
router.get("/product-page-2", function (req, res) {
    var email = req.session.email;
    res.render("pages/product-page-2", { email: email });
});
router.get("/profile", function (req, res) {
    var nome = req.session.nome;
    var email = req.session.email;

    console.log(nome);
    res.render("pages/profile", { nome: nome, email: email });
});
router.get("/register", function (req, res) {
    var email = req.session.email;
    req.flash("As senhas não coincidem");
    console.log(req.flash()); // Adicione este console log para verificar as mensagens flash
    res.render('pages/register', { email: email, messages: req.flash() });
});

router.get("/soccer", function (req, res) {
    var email = req.session.email;
    res.render("pages/soccer", { email: email });
});
router.get("/empresa", function (req, res) {
    var email = req.session.email;
    res.render("pages/empresa");
});
router.get("/add-product", function (req, res) {
    res.render("pages/add-product");
});
router.get("/cart", function (req, res) {
    var email = req.session.email;
    res.render("pages/cart", { email: email });
});

router.get("/alter", function (req, res) {
    var nome = req.session.nome;
    var sobrenome = req.session.sobrenome;
    var email = req.session.email;

    res.render("pages/alter", { nome: nome, sobrenome: sobrenome, email: email });
});

router.post("/fazerRegistro", async function (req, res) {
    const { nome, sobrenome, email, senha, cSenha } = req.body;
    // Verificar se as senhas coincidem
    if (senha !== cSenha) {
        req.flash('msg', "As senhas não coincidem");
        console.log(req.flash()); // Adicione este console log para verificar as mensagens flash
        res.render('pages/register', { email: email, messages: req.flash() });
    }

    console.log(req.flash('msg')); // Verifica se a mensagem está sendo corretamente definida

    try {

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(senha, salt);

        // Consultar se o email já está registrado
        const [rows] = await connection.query("SELECT id_cliente FROM usuario_clientes WHERE email_cliente = ?", [email]);

        // Se encontrou algum registro com o mesmo email, exibir mensagem de erro
        if (rows.length > 0) {
            req.flash('msg', "Usuario em uso.");
            console.log(req.flash()); // Adicione este console log para verificar as mensagens flash
            res.render('pages/register', { email: email, messages: req.flash() });
        }

        // Se o email não existe no banco de dados, inserir o novo registro
        await connection.query("INSERT INTO usuario_clientes (nome_cliente, sobrenome_cliente, email_cliente, senha_cliente) VALUES (?, ?, ?, ?)", [nome, sobrenome, email, hashedPassword]);

        // Redirecionar para a página de login ou outra página após o registro
        req.flash("success_msg", "Registro realizado com sucesso!");
        res.render('pages/login', { pagina: "login", logado: null });

    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

router.get("/guardarCEP", async function (req, res){
    const{ cep, rua, bairro, cidade, uf } = req.body;

    try{
        const [adress] = await connection.query("SELECT id_cliente FROM usuario_clientes WHERE cep_cliente VALUES = ?", [cep]);

        if(adress.lenght > 0){
            req.flash('msg', "Você ja tem um endereço cadastrado!")
            console.log(req.flash());
            res.render('pages/alter');
        }

        await connection.query("INSERT INTO usuario_clientes (cep_cliente, cidade_cliente, bairro_cliente, logradouro_cliente, estado) VALUES (?, ?, ?, ?)", [cep, cidade, bairro, rua, uf]);

        req.flash('msg', "Endereço cadastrado com sucesso!")
    }catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
    res.render('pages/alter', { email: email });
});


// Rota para processar o login
router.post("/fazerLogin", async function (req, res) {

    const { email, senha } = req.body;


    try {
        const account = await connection.query("SELECT * FROM usuario_clientes WHERE email_cliente = ?", [email]);

        if (account[0].length > 0) {
            // Usuário encontrado e senha corresponde
            req.session.nome = account[0][0].nome_cliente;
            req.session.sobrenome = account[0][0].sobrenome_cliente;
            req.session.email = account[0][0].email_cliente;

            // verificar se as senhas conheecidem
            const passwordMatch = bcrypt.compareSync(senha, account[0][0].senha_cliente)

            if (!passwordMatch) {
                req.flash('msg', "As senhas não conferem");
            }

            res.redirect('/profile');
        }

    } catch (err) {
        console.error("Erro na consulta: ", err);
        res.status(500).send('Erro interno do servidor');
        return;
    }

});

router.get("/fazerLogout", function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    })
})

module.exports = router;
