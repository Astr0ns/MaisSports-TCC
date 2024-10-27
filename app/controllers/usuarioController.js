const usuario = require("../models/usuarioModel");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(12);
const { removeImg } = require("../util/removeImg");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const https = require('https');
var connection = require("../../config/pool_conexoes");
const { error } = require("console");


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
        const [accounts] = await connection.query("SELECT * FROM usuario_clientes WHERE email = ? LIMIT 1", [email]);
        
        if (accounts.length > 0) {
            const account = accounts[0];

            const passwordMatch = await bcrypt.compareSync(senha, account.senha);
            console.log(passwordMatch)

            if (!passwordMatch) {
                req.flash('msg', "As senhas não conferem");
                return res.redirect('/login');
            }

            // Armazenar informações do usuário na sessão
            req.session.email = account.email;
            req.session.celular = account.celular;
            req.session.nome = account.nome;
            req.session.userId = account.id;
            req.session.sobrenome = account.sobrenome;
            req.session.userTipo = account.tipo;
            req.session.logado = true; // Atualizando a sessão

            req.flash('msg', "Logado com sucesso");
            return res.redirect('/profile'); // Redireciona após o login

        } else {
            req.flash('msg', "Usuário não encontrado");
            return res.redirect('/login');
        }

    } catch (err) {
        console.error("Erro na consulta: ", err);
        return res.status(500).send('Erro interno do servidor');
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

    const { nome, email, senha } = req.body;
    console.log(req.body.cSenha)
    console.log(senha)
    // Validação de senha
    if (senha !== req.body.cSenha) {
        req.flash('error_msg', 'As senhas não conferem.');
        return res.redirect('/register');
    }

    try {
        // Verificar se o email já existe
        const [emailExist] = await connection.query("SELECT id FROM usuario_clientes WHERE email = ?", [email]);

        if (emailExist.length > 0) {
            req.flash('error_msg', 'Email já está em uso.');
            return res.redirect('/register');
        }

        // Criptografar a senha
        const salt = bcrypt.genSaltSync(12);
        const hash = bcrypt.hashSync(senha, salt);

        console.log(`senha: ${senha}`);
        console.log(`hash: ${hash}`);

        // Inserir o novo usuário na base de dados
        await connection.query(
            "INSERT INTO usuario_clientes (nome, email, senha, celular, logradouro, bairro, cidade, cep) VALUES (?, ?, ?, ?, 'Rua Exemplo', 'Bairro Exemplo', 'Cidade Exemplo', '00000000')",
            [nome, email, hash, '00000000000']
        );

        req.flash('success_msg', 'Registro bem-sucedido! Você será redirecionado para a página de login em breve.');
        res.redirect('/register?success=true');

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao criar usuário. Tente novamente mais tarde.');
        res.redirect('/register'); // Redireciona para o formulário de registro
    }
}

const alterDados = async (req, res) => {

    var celular = req.session.celular;
    
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
        res.render('pages/alter', { email, cep, numero, celular });
    } catch (error) {
        console.error('Erro ao obter dados:', error);
        res.status(500).send('Erro ao obter dados');
    }
}

const guardarCelular = async (req, res) => {
    try{
        const userId = req.session.userId;

        if(!userId) {
            throw new error('Usuario não autenticado');
        }

        const [rows] = await connection.query(
            "SELECT celular FROM usuario_clientes WHERE id = ?", [userId]
        );

        const { celular } = rows[0];

    }catch{
        console.error('Erro ao obter dados:', error);
        res.status(500).send('Erro ao obter dados');
    }
}

module.exports = {
    regrasValidacaoFormLogin,
    logar,
    registrarUsu,
    alterDados,
    guardarCelular
};