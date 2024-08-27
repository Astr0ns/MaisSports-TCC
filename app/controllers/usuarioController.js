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

const comprar = async (req, res) => {
    const { produto_id, comprador_id, quantidade } = req.body;

    try {
        // Verificar se o produto está disponível
        const produto = await pool.query('SELECT * FROM produtos WHERE id = $1', [produto_id]);

        if (produto.rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        const produtoData = produto.rows[0];

        if (produtoData.quantidade < quantidade) {
            return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
        }

        // Registrar a venda
        const venda = await pool.query(
            'INSERT INTO vendas (produto_id, comprador_id, quantidade, vendedor) VALUES ($1, $2, $3, $4) RETURNING *',
            [produto_id, comprador_id, quantidade, produtoData.marca]
        );

        // Atualizar o estoque
        await pool.query(
            'UPDATE produtos SET quantidade = quantidade - $1 WHERE id = $2',
            [quantidade, produto_id]
        );

        res.status(201).json(venda.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao realizar compra' });
    }
};

module.exports = {
    regrasValidacaoFormLogin,
    logar,
    registrarUsu,
    comprar
};