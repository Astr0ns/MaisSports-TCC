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
            req.session.logado = true;

            console.log(req.session.userTipo)
            // Atualizando a sessão

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
            "INSERT INTO usuario_clientes (nome, email, senha, celular, logradouro, bairro, cidade, cep) VALUES (?, ?, ?, ?, 'logradouro Exemplo', 'Bairro Exemplo', 'Cidade Exemplo', '00000000')",
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
    const email = req.session.email;
    const userId = req.session.userId;

    try {
        if (!email) {
            throw new Error('Usuário não autenticado.');
        }

        // Consultar informações do usuário
        const [rows] = await connection.query(
            "SELECT cep, numero, logradouro, bairro, cidade, estado, celular FROM usuario_clientes WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            throw new Error('Usuário não encontrado.');
        }

        // Extrair dados do usuário
        const { cep, numero, logradouro, bairro, cidade, estado, celular } = rows[0];

        // Renderizar a página com os dados
        res.render('pages/alter', { email, cep, numero, logradouro, bairro, cidade, estado, celular, userId });
    } catch (error) {
        console.error('Erro ao obter dados:', error);
        res.status(500).send('Erro ao obter dados do usuário.');
    }
};


const guardarCelular = async (req, res) => {
    try {
        const userId = req.session.userId;
        const novoCelular = req.body.celular;

        if (!userId) {
            throw new Error('Usuário não autenticado.');
        }

        // Query para verificar se o usuário existe
        const [rows] = await connection.query(
            "SELECT id FROM usuario_clientes WHERE id = ?",
            [userId]
        );

        if (rows.length === 0) {
            throw new Error('Usuário não encontrado.');
        }

        // Atualizar o celular na tabela
        await connection.query(
            "UPDATE usuario_clientes SET celular = ? WHERE id = ?",
            [novoCelular, userId]
        );

        req.flash('success_msg', 'Número de celular salvo com sucesso!');
        res.redirect('/alter')
    } catch (error) {
        console.error('Erro ao atualizar celular:', error);
        res.status(500).send('Erro ao atualizar celular');
    }
};

const excluirOuAlterarCelular = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            throw new Error('Usuário não autenticado.');
        }

        // Ação escolhida (excluir ou alterar para 0)
        const { acao } = req.body;

        if (acao === 'excluir') {
            // Excluir celular (definir como NULL)
            await connection.query(
                "UPDATE usuario_clientes SET celular = NULL WHERE id = ?",
                [userId]
            );
        } else {
            throw new Error('Ação inválida.');
        }

        req.flash('success_msg', 'Número de celular salvo com sucesso!');
        res.redirect('/alter')
    } catch (error) {
        console.error('Erro ao excluir ou alterar celular:', error);
        res.status(500).send('Erro ao atualizar celular');
    }
};

const guardarCEP = async (req, res) => {
    const { cep, numero, bairro, cidade, logradouro, uf } = req.body;
    const email = req.session.email;

    if (!email) {
        console.error('Usuário não autenticado.');
        return res.status(400).send('Erro: Usuário não está logado.');
    }

    try {
        // Verificar se o usuário existe
        const [rows] = await connection.query(
            "SELECT * FROM usuario_clientes WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            throw new Error('Usuário não encontrado.');
        }

        // Atualizar ou adicionar endereço
        const [result] = await connection.query(
            "UPDATE usuario_clientes SET cep = ?, numero = ?, bairro = ?, cidade = ?, logradouro = ?, estado = ? WHERE email = ?",
            [cep, numero, bairro, cidade, logradouro, uf, email]
        );

        if (result.affectedRows === 0) {
            throw new Error('Erro ao salvar o endereço.');
        }

        // Mensagem de sucesso
        req.flash('success_msg', "Endereço atualizado com sucesso!");
        return res.redirect('/alter');
    } catch (error) {
        console.error('Erro ao salvar endereço:', error);
        req.flash('error_msg', 'Erro ao salvar o endereço.');
        return res.redirect('/alter');
    }
};


const excluirOuRedefinirEndereco = async (req, res) => {
    const email = req.session.email;

    if (!email) {
        console.error('Usuário não autenticado.');
        return res.status(400).send('Erro: Usuário não está logado.');
    }

    const { acao } = req.body;

    try {
        if (acao === 'excluir') {
            // Excluir endereço (definir campos como NULL)
            await connection.query(
                "UPDATE usuario_clientes SET cep = NULL, numero = NULL, bairro = NULL, cidade = NULL, logradouro = NULL, estado = NULL WHERE email = ?",
                [email]
            );
        } else if (acao === 'redefinir') {
            // Redefinir endereço (definir valores padrão, ex.: '0' ou strings vazias)
            await connection.query(
                "UPDATE usuario_clientes SET cep = '0', numero = '0', bairro = '', cidade = '', logradouro = '', estado = '' WHERE email = ?",
                [email]
            );
        } else {
            throw new Error('Ação inválida.');
        }

        console.log("Endereço atualizado com sucesso!");
        return res.redirect('/alter');
    } catch (error) {
        console.error('Erro ao excluir ou redefinir endereço:', error);
        res.status(500).send('Erro ao excluir ou redefinir endereço.');
    }
};



module.exports = {
    regrasValidacaoFormLogin,
    logar,
    registrarUsu,
    alterDados,
    guardarCelular,
    guardarCEP,
    excluirOuAlterarCelular,
    excluirOuRedefinirEndereco,
};