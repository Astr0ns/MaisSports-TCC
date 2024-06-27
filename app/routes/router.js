var express = require("express");
var router = express.Router();
exports.router = router;
const connection = require("../../config/pool_conexoes");
const req = require("express/lib/request");

router.get("/", function (req, res) {
    var email = req.session.email;
    req.session.email;
    res.render("pages/index", {email: email});
});

router.get("/login", function (req, res) {
    res.render("pages/login");
});
router.get("/locais-esportivos", function (req, res) {
    res.render("pages/locais-esportivos");
});
router.get("/product-page", function (req, res) {
    res.render("pages/product-page");
});
router.get("/product-page-2", function (req, res) {
    res.render("pages/product-page-2");
});
router.get("/profile", function (req, res) {
    var nome = req.session.nome;
    var email = req.session.email;

    console.log(nome);
    res.render("pages/profile", { nome: nome, email: email });
});
router.get("/register", function (req, res) {
    res.render("pages/register");
});
router.get("/soccer", function (req, res) {
    res.render("pages/soccer");
});
router.get("/empresa", function (req, res) {
    res.render("pages/empresa");
});
router.get("/add-product", function (req, res) {
    res.render("pages/add-product");
});
router.get("/cart", function (req, res) {
    res.render("pages/cart");
});

router.get("/alter", function (req, res) {
    var nome = req.session.nome;
    var sobrenome = req.session.sobrenome;
    var email = req.session.email;

    res.render("pages/alter", { nome: nome, sobrenome: sobrenome, email: email });
});

router.post("/fazerRegistro", async function (req, res) {

    const { nome, sobrenome, email, senha, cSenha } = req.body;

    

    if(senha != cSenha){
        req.flash("msg", "As senhas não coicidem");
        return res.render('/register');
    }

    try {
        const emailExist = await connection.query("SELECT id_cliente FROM usuario_clientes WHERE email_cliente = ?", [email]);

        await connection.query("INSERT INTO usuario_clientes (nome_cliente, sobrenome_cliente, email_cliente, senha_cliente) VALUES (?, ?, ?, ?)", [nome, sobrenome, email, senha]); {
            res.render('pages/login', { pagina: "login", logado: null });
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
    // Verificar se os dados estão chegando corretamente
    console.log("Dados recebidos:", req.body);
});




// Rota para processar o login
router.post("/fazerLogin", async function (req, res) {

    const { email, senha } = req.body;


    try {
        const account = await connection.query("SELECT * FROM usuario_clientes WHERE email_cliente = ? AND senha_cliente = ?", [email, senha]);

            if (account[0].length > 0) {
                // Usuário encontrado e senha corresponde
                req.session.nome = account[0][0].nome_cliente;
                req.session.sobrenome = account[0][0].sobrenome_cliente;
                req.session.email = account[0][0].email_cliente;
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
