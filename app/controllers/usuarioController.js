const usuario = require("../models/usuarioModel");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(12);
const { removeImg } = require("../util/removeImg");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const https = require('https');
var connection = require("../../config/pool_conexoes");


// Regras de validação para o formulário de login

const regrasValidacaoFormLogin = [
    body('email')
        .isEmail().withMessage('Insira um email válido')
        .normalizeEmail(),
    body('senha')
        .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres')
];

// Função de login
const logar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('pages/login', {
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
        const [accounts] = await connection.query("SELECT * FROM usuario_clientes WHERE email = ?", [email]);

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
            req.session.sobrenome = account.sobrenome;
            req.session.cep = account.cep;
            req.session.numero = account.numero;

            res.render('pages/profile', {
                userId: req.session.userId,
                logado: req.session.logado,
                email: req.session.email,
                nome: req.session.nome,
                sobrenome: req.session.sobrenome,
                mensage: req.flash('msg', "logado"),
            });

            console.log(re.flash('msg'))
        } else {
            req.flash('msg', "Usuário não encontrado");
            res.redirect('/login');
        }

    } catch (err) {
        console.error("Erro na consulta: ", err);
        res.status(500).send('Erro interno do servidor');
    }
};

// Função Registrar

const registrarUsu = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('pages/register', {
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

    const { nome, sobrenome, email, senha, cSenha } = req.body;

    // Verificar se as senhas conferem
    if (senha !== cSenha) {
        req.flash('error_msg', 'As senhas não conferem.');
        return res.redirect('/register'); // Redireciona para o formulário de registro
    }

    try {
        // Verificar se o email já existe
        const [emailExist] = await connection.query("SELECT id FROM usuario_clientes WHERE email = ?", [email]);

        if (emailExist.length > 0) {
            req.flash('error_msg', 'Email já está em uso.');
            return res.redirect('/register'); // Redireciona para o formulário de registro
        }

        // Criptografar a senha
        const hash = await bcrypt.hash(senha, 10);

        // Inserir o novo usuário na base de dados
        await connection.query("INSERT INTO usuario_clientes (nome, sobrenome, email, senha, tipo, cep, numero) VALUES (?, ?, ?, ?, 'usuario', '00000000', '0000')", [nome, sobrenome, email, hash]);

        req.flash('success_msg', 'Registro bem-sucedido! Você será redirecionado para a página de login em breve.');
        res.redirect('/register?success=true');
        // Redireciona para a página de registro, indicando sucesso

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao criar usuário. Tente novamente mais tarde.');
        res.redirect('/register'); // Redireciona para o formulário de registro
    }
}

module.exports = {
    regrasValidacaoFormLogin,
    logar,
    registrarUsu,
};