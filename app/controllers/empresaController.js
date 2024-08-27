const usuario = require("../models/usuarioModel");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(12);
const { removeImg } = require("../util/removeImg");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const https = require('https');
const upload = require('../models/upload-middleware');



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
        return res.redirect('/login-empr'); // Redireciona para o formulário de registro
    }

    try {
        // Verificar se o email já existe
        const [emailExist] = await connection.query("SELECT id FROM empresas WHERE email = ?", [email]);

        if (emailExist.length > 0) {
            req.flash('error_msg', 'Email corporativo em uso.');
            return res.redirect('/regs-empr'); // Redireciona para o formulário de registro
        }

        // Criptografar a senha
        const hash = await bcrypt.hash(senha, 10);

        // Inserir o novo usuário na base de dados
        await connection.query("INSERT INTO empresas (nome, cnpj, email, senha, tipo, cep, numero) VALUES (?, ?, ?, ?, 'empresa', '00000000', '0000')", [nome, cnpj, email, hash]);

        req.flash('success_msg', 'Registro bem-sucedido! Você será redirecionado para o "Dashboard" em breve.');
        res.redirect('/regs-empr?success=true');
        // Redireciona para a página de registro, indicando sucesso

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao criar empresa. Tente novamente mais tarde.');
        res.redirect('/regs-empr'); // Redireciona para o formulário de registro
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

    try {
        const [accounts] = await connection.query("SELECT * FROM empresas WHERE email = ?", [email]);

        if (accounts.length > 0) {
            const account = accounts[0];

            // Verificar se a senha corresponde
            const passwordMatch = bcrypt.compareSync(senha, account.senha);

            if (!passwordMatch) {
                req.flash('msg', "As senhas não conferem");
                return res.redirect('/login'); // Redireciona para a página de login se as senhas não conferem
            }

            // Armazenar informações do usuário na sessão
            req.session.email = account.email;
            req.session.nome = account.nome;
            req.session.cep = account.cep;
            req.session.numero = account.numero;

            res.render('pages/profile', {
                userId: req.session.userId,
                logado: req.session.logado,
                email: req.session.email,
                nome: req.session.nome,
                mensage: req.flash('msg', "logado"),
            });

            console.log(re.flash('msg'))
        } else {
            req.flash('msg', "Empresa não encontrada");
            res.redirect('/login-empr');
        }

    } catch (err) {
        console.error("Erro na consulta: ", err);
        res.status(500).send('Erro interno do servidor');
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
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao adicionar produto' });
    }
}

module.exports = {
    regrasValidacaoFormLogin,
    logarEmpr,
    registrarEmpr,
    adicionarProduto,
};