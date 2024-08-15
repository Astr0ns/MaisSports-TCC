var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(12);
var connection = require("../../config/pool_conexoes");
const mysql = require('mysql2/promise');
const flash = require('connect-flash');
const usuarioController = require('../controllers/usuarioController'); // Certifique-se de que o caminho está correto
const gravarUsuAutenticado = require('../models/usuarioModel').gravarUsuAutenticado; // Certifique-se de que a função está corretamente exportada


const {
    verificarAutenticacao,
    verificarAutorizacao,
} = require("../models/middleware");

const uploadFile = require("../util/uploader")("./app/public/imagem/perfil/");
// const uploadFile = require("../util/uploader")();


router.get("/", function (req, res) {
    var email = req.session.email;
    req.session.email;
    res.render("pages/index", { email: email });
});

router.get("/", verificarAutenticacao, function (req, res) {
    res.render("pages/home", {
        userId: req.session.userId,
        listaErros: null,
        dadosNotificacao: null,
        valores: { nome_usu: "", nomeusu_usu: "", email_usu: "", senha_usu: "" },
    });
});

// 

router.get("/login", function (req, res) {
    res.render("pages/login", { listaErros: null, dadosNotificacao: null });
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
    var cep = req.session.cep;
    var numero = req.session.numero;
    var autenticado = req.session.autenticado;

    req.session.cep = cep;
    req.session.numero = numero;

    res.render("pages/profile", {
        nome: nome,
        email: email,
        autenticado: autenticado,
        numero: numero,
        cep: cep,
        messages: req.flash('msg', "logado com sucesso!"),
    });
});

// router.post("/alterType", async function (req, res){
// UPDATE usuario_clientes SET tipo = 'usuario' WHERE id = 57;
// });


router.get("/register", function (req, res) {
    res.render("pages/register", {
        listaErros: null,
        dadosNotificacao: null,
        valores: { nome_usu: "", nomeusu_usu: "", email_usu: "", senha_usu: "" },
    });
});



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
    try {
        const email = req.session.email;

        if (!email) {
            throw new Error('Usuário não autenticado.');
        }

        // Query usando o email em vez do userId
        const [rows] = await connection.query(
            "SELECT cep, numero FROM usuario_clientes WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            throw new Error('Usuário não encontrado.');
        }

        const { cep, numero } = rows[0]; // Obter os dados retornados

        // Renderizar a página com as informações
        res.render('pages/alter', { email, cep, numero });
    } catch (error) {
        console.error('Erro ao obter dados:', error);
        res.status(500).send('Erro ao obter dados');
    }
});

router.post("/fazerRegistro", async function (req, res) {
    const { nome, sobrenome, email, senha, cSenha } = req.body;

    if (senha != cSenha) {
        req.flash("msg", "As senhas não coicidem");
        return res.render('/register');
    }

    const hash = await bcrypt.hash(senha, 10);

    try {
        const emailExist = await connection.query("SELECT id FROM usuario_clientes WHERE email = ?", [email]);

        await connection.query("INSERT INTO usuario_clientes (nome, sobrenome, email, senha, tipo, cep, numero) VALUES (?, ?, ?, ?, 'usuario', '00000000', '0000')", [nome, sobrenome, email, hash]); {
            res.render('pages/login', { pagina: "login", logado: null });
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
    // Verificar se os dados estão chegando corretamente
});

router.get('/guardarCEP', async (req, res) => {
    const { cep, numero } = req.query;
    const email = req.session.email;

    console.log('cep:', cep);
    console.log('numero:', numero);
    console.log('email:', email);

    if (!email) {
        console.error('id não definido na sessão.');
        return res.status(400).send('Erro: Usuário não está logado.');
    }

    try {
        const [rows] = await connection.query(
            "SELECT * FROM usuario_clientes WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            throw new Error('email não encontrado na tabela.');
        }

        const [result] = await connection.query(
            "UPDATE usuario_clientes SET cep = ?, numero = ? WHERE email = ?",
            [cep, numero, email]
        );

        if (result.affectedRows === 0) {
            throw new Error('Nenhuma linha foi afetada. Verifique se o email está correto.');
        }

        req.session.cep = cep;

        console.log("Endereço cadastrado com sucesso!");
        return res.redirect('/alter');
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(400).send(error.message);
        }
    }
});

router.post("/fazerLogin",
    usuarioController.regrasValidacaoFormLogin,
    gravarUsuAutenticado,
    async function (req, res) {
        const { email, senha } = req.body;

        try {
            const [accounts] = await connection.query("SELECT * FROM usuario_clientes WHERE email = ?", [email]);

            if (accounts.length > 0) {
                const account = accounts[0];

                // Verificar se a senha corresponde
                const passwordMatch = bcrypt.compareSync(senha, account.senha);

                if (!passwordMatch) {
                    req.flash('msg', "As senhas não conferem");
                    return res.redirect('/login');
                }

                // Armazenar informações do usuário na sessão
                req.session.email = account.email;
                req.session.nome = account.nome;
                req.session.sobrenome = account.sobrenome;
                req.session.cep = account.cep;
                req.session.numero = account.numero;

                console.log(req.flash('msg', "Logado com sucesso!"))
                req.flash('msg', 'Login efetuado com sucesso!');
                res.redirect('/profile'); // Redireciona para a página de perfil
            } else {
                req.flash('msg', "Usuário não encontrado");
                res.redirect('/login');
            }

        } catch (err) {
            console.error("Erro na consulta: ", err);
            res.status(500).send('Erro interno do servidor');
        }
    }
);

router.post('/delCEP', async function (req, res) {
    const { email } = req.body;

    let = connection;

    if (!email) {
        return res.status(400).json({ error: 'Email não fornecido.' });
    }

    try {
        connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            "UPDATE usuario_clientes SET cep = '00000000' WHERE email = ?",
            [email]
        );

        if (result.affectedRows > 0) {
            res.json({ message: 'Endereço excluído com sucesso.' });
        } else {
            res.status(404).json({ error: 'Email não encontrado.' });
        }
    }
    catch (error) {
        console.error('Erro ao atualizar o CEP:', error);
        res.status(500).json({ error: 'Erro ao excluir o endereço.' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }

})



router.get("/fazerLogout", function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    })
});





module.exports = router;
