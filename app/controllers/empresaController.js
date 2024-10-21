const usuario = require("../models/usuarioModel");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(12);
const { removeImg } = require("../util/removeImg");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const https = require('https');
const upload = require('../models/upload-middleware');
const connection = require("../../config/pool_conexoes");



// Regras de validação para o formulário de login

const regrasValidacaoFormLogin = [
    body('email')
        .isEmail().withMessage('Insira um email válido')
        .normalizeEmail(),
    body('senha')
        .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres')
];

// Função de login

const registrarEmpr = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('pages/regs-empr', {
            userId: req.session.userId,
            listaErros: errors.array(),
            dadosNotificacao: null,
            valores: {
                nome_usu: "",
                nomeusu_usu: "",
                email_usu: req.body.email,
                senha_usu: ""
            },
        });
    }

    const { nome, cnpj, email, senha, cSenha } = req.body;

    // Verificar se as senhas conferem
    if (senha !== cSenha) {
        req.flash('error_msg', 'As senhas não conferem.');
        return res.redirect('/regs-empr');
    }

    try {
        // Verificar se o email ou CNPJ já existem
        const [existingRecords] = await connection.query("SELECT id FROM empresas WHERE email = ? OR cnpj = ?", [email, cnpj]);

        if (existingRecords.length > 0) {
            if (existingRecords[0].email === email) {
                req.flash('error_msg', 'Email corporativo em uso.');
            } else {
                req.flash('error_msg', 'CNPJ corporativo em uso.');
            }
            return res.redirect('/regs-empr');
        }

        // Criptografar a senha
        const hash = await bcrypt.hash(senha, 12);

        // Inserir o novo usuário na base de dados
        await connection.query("INSERT INTO empresas (nome, cnpj, email, senha, tipo, cep, logradouro) VALUES (?, ?, ?, ?, 'empresa', '00000000', '0000')", [nome, cnpj, email, hash]);

        req.flash('success_msg', 'Registro bem-sucedido! Você será redirecionado para a página de Login em breve.');
        return res.redirect('/login-empr'); // Redireciona para a página de login após registro

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao criar empresa. Tente novamente mais tarde.');
        return res.redirect('/regs-empr');
    }
};


const logarEmpr = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('pages/login-empr', {
            userId: req.session.userId,
            listaErros: errors.array(),
            dadosNotificacao: null,
            valores: {
                nome_usu: "",
                nomeusu_usu: "",
                email_usu: req.body.email,
                senha_usu: ""
            },
        });
    }

    const { email, senha } = req.body;

    // Remove espaços em branco
    const senhaTrimmed = senha.trim();

    try {
        // Buscar empresa com base no email
        const [accounts] = await connection.query("SELECT * FROM empresas WHERE email = ?", [email]);

        if (accounts.length === 0) {
            req.flash('error_msg', "Usuário não encontrado");
            return res.redirect('/login-empr');
        }

        const account = accounts[0];

        // Comparar a senha fornecida com o hash armazenado
        const passwordMatch = await bcrypt.compare(hash, account.senha);

        console.log("Senha fornecida:", senhaTrimmed);
        console.log("Hash armazenado:", account.senha);
        console.log("Senha corresponde?", passwordMatch);

        if (!passwordMatch) {
            req.flash('error_msg', "Senha incorreta");
            return res.redirect('/login-empr');
        }

        // Armazenar informações do usuário na sessão
        req.session.email = account.email;
        req.session.nome = account.nome;
        req.session.userTipo = account.tipo;
        req.session.cnpj = account.cnpj;
        req.session.userId = account.id;
        req.session.logado = true;

        req.flash('success_msg', "Logado com sucesso");
        return res.redirect('/empresa'); // Redireciona após o login

    } catch (err) {
        console.error("Erro na consulta: ", err);
        return res.status(500).send('Erro interno do servidor');
    }
};

const adicionarProduto = async (req, res) => {
    const { nome, descricao, preco, quantidade, marca, localizacao } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO produtos (nome, descricao, preco, quantidade, marca, localizacao) VALUES (R$1, R$2, R$3, R$4, R$5, R$6) RETURNING *',
            [nome, descricao, preco, quantidade, marca, localizacao]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao adicionar produto' });
    }
}


const verSeEmpresa = async (req, res) => {
    const email = req.session.email;
    const nome = req.session.nome;

    try {
        // Primeiro, verificamos na tabela usuario_clientes
        const queryClientes = `SELECT * FROM usuario_clientes WHERE email = ?`;
        const [resultClientes] = await connection.query(queryClientes, [email]);

        if (resultClientes.length > 0) {
            // Se o usuário for encontrado na tabela usuario_clientes
            const usuario = resultClientes[0];
            // Coloque aqui o código que você já tem para o usuário encontrado
            res.render("pages/profile", { user: usuario, nome: nome, email: email });
        } else {
            // Se não for encontrado, verificamos na tabela empresas
            const queryEmpresas = `SELECT * FROM empresas WHERE email = ?`;
            const [resultEmpresas] = await connection.query(queryEmpresas, [email]);

            if (resultEmpresas.length > 0) {
                // Se a empresa for encontrada
                const empresa = resultEmpresas[0];
                // Coloque aqui o código que você já tem para a empresa encontrada
                res.render("pages/painel-empresa", { company: empresa, nome: nome, email: email });
            } else {
                // Se não encontrar nem na tabela de clientes nem na de empresas
                // Coloque aqui o código para lidar com a ausência de usuário/empresa
                res.render("pages/login");
            }
        }
    } catch (error) {
        console.error("Erro ao buscar dados no banco de dados:", error);
        res.status(500).send("Erro ao buscar dados");
    }
};


module.exports = {
    regrasValidacaoFormLogin,
    logarEmpr,
    registrarEmpr,
    adicionarProduto,
    verSeEmpresa,
};