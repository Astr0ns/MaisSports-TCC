var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(12);
var connection = require("../../config/pool_conexoes");
const mysql = require('mysql2/promise');
const flash = require('connect-flash');
const app = require('../../app');
const usuarioController = require('../controllers/usuarioController');
const empresaController = require('../controllers/empresaController');
const gravarUsuAutenticado = require('../models/usuarioModel').gravarUsuAutenticado;
const registrarUsu = require('../models/usuarioModel').registrarUsu;
const gravarEmprAutenticado = require('../models/empresaModel').gravarEmprAutenticado;
const locaisController = require('../controllers/locaisController');
const produtoController = require('../controllers/produtoController');

const multer = require('multer');
const fs = require('fs');
const path = require('path');
// Configuração do armazenamento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/';
        
        // Verifica se a pasta existe
        fs.mkdir(uploadPath, { recursive: true }, (err) => {
            if (err) {
                return cb(err);
            }
            cb(null, uploadPath); // Passa a pasta como destino
        });
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Renomeia o arquivo
    }
});
// Configuração do multer
const upload = multer({ storage: storage }).array('imagens', 4);


const { verificarAutenticacao, verificarAutorizacaoTipo } = require('../models/middleware');

const uploadFile = require("../util/uploader")("./app/public/imagem/perfil/");
// const uploadFile = require("../util/uploader")();







router.get("/", async function (req, res) {
    var email = req.session.email;

    res.render("pages/index", {
        email: email,
        userId: req.session.userId,
        listaErros: null,
        dadosNotificacao: null,
        messages: req.flash('msg', "logado com sucesso!"),
        valores: { nome_usu: "", nomeusu_usu: "", email_usu: "", senha_usu: "" },
    });
});

//

router.get("/add-locais", function (req, res) {
    var email = req.session.email;
    res.render("pages/add-locais", { email: email });
});



router.get("/produto-confirmado", produtoController.adicionarProdutoConfirmado);

router.post("/adicionarLocais", upload, locaisController.adicionarLocais, async function (req, res) {
    //
});
router.post("/avaliarLocais", verificarAutenticacao, locaisController.avaliarLocais, async function (req, res) {

});

router.post("/avaliarLocaisBanco", upload, verificarAutenticacao, locaisController.avaliarLocaisBanco, async function (req, res) {

});

router.get("/add-product", function (req, res) {
    var email = req.session.email;
    res.render("pages/add-product", { email: email });
});

router.post("/adicionarProd", upload, produtoController.adicionarProd, async function (req, res) {

});

router.get("/pegarProdutoBanco", produtoController.pegarProdutoBanco, async function (req, res) {
    //
});

router.get("/pegarProdutoEmpresa", produtoController.pegarProdutoEmpresa, async function (req, res) {
    //
});


router.get("/painel-empresa", function (req, res) {
    var email = req.session.email;
    res.render("pages/painel-empresa", { email: email });
});

router.get("/favoritarProd/:id", produtoController.favoritarProd, async function (req, res){
});

router.get("/itens-curtidos", function (req, res) {
    var email = req.session.email;
    res.render("pages/itens-curtidos", { email: email });
});

router.get("/pegarProdutoCurtido", produtoController.pegarProdutoCurtido, async function (req, res) {
    //
});

router.get("/login", function (req, res) {
    res.render("pages/login", {
        listaErros: null,
        dadosNotificacao: null,
        valores: { nome: "", sobrenome: "", email: "" }
    });
});
router.get("/login-empr", function (req, res) {
    res.render("pages/login-empr", {
        listaErros: null,
        dadosNotificacao: null,
        valores: { nome: "", sobrenome: "", email: "" }
    });
});

router.get("/verSeEmpresa", empresaController.verSeEmpresa, async function (req, res) {
    //
});


// pagina locais
router.get("/locais-esportivos", async function (req, res) {
    var email = req.session.email;
    var nome = req.session.nome;



    res.render("pages/locais-esportivos", { nome: nome, email: email });
})

router.get("/locaisBanco", locaisController.locaisBanco, async function (req, res) {
    //
});

router.get("/getLocalFromId", locaisController.getLocalFromId, async function (req, res) {
    //
});

router.get("/product-page/:id", produtoController.getProductById, async function (req, res){
    var email = req.session.email;
    res.render("pages/product-page", { email: email });
});



router.get("/profile", verificarAutenticacao, function (req, res) {
    var nome = req.session.nome;
    var email = req.session.email;
    var cep = req.session.cep;
    var numero = req.session.numero;
    var autenticado = req.session.autenticado;

    req.session.cep = cep;
    req.session.numero = numero;
    req.flash('success_msg', 'Você foi logado com sucesso!');
    res.render("pages/profile", {
        nome: nome,
        email: email,
        autenticado: autenticado,
        numero: numero,
        cep: cep,
    });
});


router.get("/alter-account", verificarAutenticacao, async function (req, res) {
    email = req.session.email;
    nome = req.session.nome;
    sobrenome = req.session.sobrenome;
    celular = req.session.celular;
    res.render("pages/alter-account", {
        email: email,
        nome: nome,
        sobrenome: sobrenome,
        celular: celular,
    });
});

router.get("/regs-empr", function (req, res) {
    res.render("pages/regs-empr", {
        listaErros: null,
        dadosNotificacao: null,
        valores: { nome: "", sobrenome: "", email: "" }
    });
});




// router.post("/alterType", async function (req, res){
// UPDATE usuario_clientes SET tipo = 'usuario' WHERE id = 57;
// });


router.get("/register", function (req, res) {
    res.render("pages/register", {
        listaErros: null,
        dadosNotificacao: null,
        valores: { nome: "", sobrenome: "", email: "" }
    });
});


router.post("/alterType", verificarAutenticacao, async function (req, res) {
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

router.get("/empresa", verificarAutenticacao, function (req, res) {

    var nome = req.session.nome;
    var email = req.session.email;
    var cep = req.session.cep;
    var numero = req.session.numero;
    var autenticado = req.session.autenticado;
    var tipo = req.session.tipo;
    var cnpj = req.session.cnpj;


    req.session.cep = cep;
    req.session.numero = numero;
    req.flash('success_msg', 'Você foi logado com sucesso!');
    res.render("pages/empresa", {
        nome: nome,
        email: email,
        autenticado: autenticado,
        numero: numero,
        cep: cep,
        cnpj: cnpj,
        tipo: tipo,
    });
});

router.get("/add-product", verificarAutenticacao, function (req, res) {
    res.render("pages/add-product");
});
router.get("/cart", function (req, res) {
});

router.get('/alter', usuarioController.alterDados, usuarioController.guardarCelular, verificarAutenticacao, async (req, res) => {
    //
});

router.post("/fazerRegistro", usuarioController.registrarUsu, async function (req, res) {
    // 
});
router.post("/fazerLogin", usuarioController.logar, async function (req, res) {
    //
});


router.post("/fazerRegisEmpr", empresaController.registrarEmpr, async function (req, res) {
    //
});

router.post('/loginEmpr', empresaController.logarEmpr, async function (req, res) {
    //
})

router.get("/fazerLogout", function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    })
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

router.post("/loginEmpr",
    usuarioController.regrasValidacaoFormLogin,
    gravarEmprAutenticado,
    async function (req, res) {
        const { email, senha } = req.body;

        try {
            const [accounts] = await connection.query("SELECT * FROM empresas WHERE email = ?", [email]);

            if (accounts.length > 0) {
                const account = accounts[0];

                // Verificar se a senha corresponde
                const passwordMatch = bcrypt.compareSync(senha, account.senha);

                if (!passwordMatch) {
                    req.flash('error_msg', "As senhas não conferem");
                    return res.redirect('/login');
                }

                // Armazenar informações do usuário na sessão
                req.session.email = account.email;
                req.session.nome = account.nome;
                req.session.cpnj = account.cpnj;
                req.session.cep = account.cep;
                req.session.numero = account.numero;

                req.flash('success_msg', 'Login efetuado com sucesso!');
                res.redirect('/empresa'); // Redireciona para a página de perfil
            } else {
                req.flash('error_msg', "Usuário não encontrado! Email ou senhas incorretos");
                res.redirect('/login-empr');
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

router.post('/comprar', async (req, res) => {

});

router.get("/fazerLogout", function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    })
});



module.exports = router;
