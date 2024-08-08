var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(12);
var connection = require("../../config/pool_conexoes");
const mysql = require('mysql2/promise');
const flash = require('connect-flash');
const authMiddleware = require('.././models/middleware')

const {
    verificarUsuAutenticado,
    limparSessao,
    gravarUsuAutenticado,
    verificarUsuAutorizado,
} = require("../models/middleware");

const usuarioController = require("../controllers/usuarioController");

const uploadFile = require("../util/uploader")("./app/public/imagem/perfil/");
// const uploadFile = require("../util/uploader")();


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
router.get("/profile", async function (req, res) {
    var nome = req.session.nome;
    var email = req.session.email;
    var autenticado = req.session.autenticado;
    res.render("pages/profile", { nome: nome, email: email, autenticado: autenticado });
});

// router.post("/alterType", async function (req, res){
// UPDATE usuario_clientes SET tipo = 'usuario' WHERE id_cliente = 57;
// });

router.post("/alterType", async function (req, res) {
    const { email, senha, cnpj, cSenha } = req.body;

    if (senha != cSenha) {
        req.flash("msg", "As senhas não coicidem");
        return res.render('/regiEmpresa')
    }
    const hash = await bcrypt.hash(senha, 10);
    try {
        const emailExist = await connection.query("SELECT id_empresa FROM empresas WHERE email = ? AND cnpj = ?", [email, cnpj]);

        await connection.query("INSERT INTO empresas (cnpj, email, senha, tipo) VALUES = (?, ?, ?)", [email, cnpj, hash]); {
            res.render('pages/empresa', { pagina: "empresa", logado: null });
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});
router.get("/register", function (req, res) {
    res.render("pages/register", {
        listaErros: null,
        dadosNotificacao: null,
        valores: { nome_usu: "", nomeusu_usu: "", email_usu: "", senha_usu: "" },
    });
});

router.post("/fazerRegistro", async function (req, res) {
    const { nome, sobrenome, email, senha, cSenha } = req.body;

    if (senha != cSenha) {
        req.flash("msg", "As senhas não coicidem");
        return res.render('/register');
    }

    const hash = await bcrypt.hash(senha, 10);

    try {
        const emailExist = await connection.query("SELECT id_cliente FROM usuario_clientes WHERE email = ?", [email]);

        await connection.query("INSERT INTO usuario_clientes (nome, sobrenome, email, senha, tipo) VALUES (?, ?, ?, ?, 'usuario')", [nome, sobrenome, email, hash]); {
            res.render('pages/login', { pagina: "login", logado: null });
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
    // Verificar se os dados estão chegando corretamente
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

router.get('/alter', async (req, res) => {
    const userId = req.session.userId;
    
    try {
        const [rows] = await connection.query(
            "SELECT cep FROM usuario_clientes WHERE id_cliente = ?",
            [userId]
        );

        const cep = rows.length > 0 ? rows[0].cep : null;
        const email = req.session.email || null;

        console.log('Email:', email); // Debug
        console.log('CEP:', cep); // Debug

        res.render('pages/alter', { email, cep });
    } catch (error) {
        console.error('Erro ao obter dados:', error);
        res.status(500).send('Erro ao obter dados');
    }
});

router.get('/guardarCEP', async (req, res) => {
    const { cep, numero } = req.query;
    const userId = req.session.userId;

    let conn;

    try {
        conn = await connection.getConnection(); // Obtém uma conexão do pool

        try {
            // Verifique se o endereço já está cadastrado
            const [rows] = await conn.query(
                "SELECT id_cliente FROM usuario_clientes WHERE cep = ?",
                [cep]
            );

            if (rows.length > 0) {
                req.flash('msg', "Você já tem um endereço cadastrado!");
                return res.redirect('/alter');
            }

            // Insira o novo endereço no banco de dados
            await conn.query(
                "UPDATE usuario_clientes SET cep = ?, numero = ? WHERE id_cliente = ?",
                [cep, numero, userId]
            );

            // Atualiza a sessão com o novo CEP
            req.session.cep = cep;

            req.flash('msg', "Endereço cadastrado com sucesso!");
            return res.redirect('/alter');
        } finally {
            if (conn) conn.release(); // Libere a conexão após o uso
        }
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(400).send(error.message);
        }
    }
});


router.get('/empresa', authMiddleware, (req, res) => {
    res.send(`Bem-vindo ao seu dashboard, usuário ID ${req.session.userId}`);
});

// Rota para processar o login
router.post("/fazerLogin", async function (req, res) {

    const { email, senha } = req.body;

    try {
        const account = await connection.query("SELECT * FROM usuario_clientes WHERE email = ?", [email]);

        if (account[0].length > 0) {
            // Usuário encontrado e senha corresponde
            req.session.nome = account[0][0].nome;
            req.session.sobrenome = account[0][0].sobrenome;
            req.session.email = account[0][0].email;

            // verificar se as senhas conheecidem
            const passwordMatch = bcrypt.compareSync(senha, account[0][0].senha)

            if (!passwordMatch) {
                req.flash('msg', "As senhas não conferem");
                return res.redirect('/login'); // Redireciona para a página de login se as senhas não conferem
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
});





module.exports = router;
