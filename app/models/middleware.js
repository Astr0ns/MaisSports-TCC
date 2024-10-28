const express = require('express');
const { validationResult } = require("express-validator");
const router = express.Router();
const usuario = require("./usuarioModel");
const app = require('../../app');
const flash = require('connect-flash');

// Middleware de autenticação
const verificarAutenticacao = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        req.flash('error_msg', 'Você deve estar logado para acessar esta página.');
        res.redirect('/login'); // Redireciona se não estiver autenticado
    }
};
// Middleware para verificar autorização
const verificarAutorizacao = (req, res, next) => {
    const userTipo = req.session.userTipo; 

    // Verificar a rota acessada
    if (req.path === 'pages/empresa-painel' && userTipo === 'usuario') {
        req.flash('error_msg', 'Usuários não têm permissão para acessar a página de empresas.');
        return res.redirect('/profile'); // Redireciona para a página inicial ou outra de sua escolha
    }
    if (req.path === 'pages/add-product' && userTipo === 'usuario') {
        req.flash('error_msg', 'Usuários não têm permissão para acessar a página de empresas.');
        return res.redirect('/profile'); // Redireciona para a página inicial ou outra de sua escolha
    }

    if (req.path === 'pages/profile' && userTipo === 'empresa') {
        req.flash('error_msg', 'Empresas não têm permissão para acessar a página de perfil.');
        return res.redirect('/painel-empresa'); // Redireciona para a página de empresas
    }

    next(); // Usuário autorizado, continue
};

// Middleware para buscar tipo de usuário no banco de dados e armazená-lo na sessão
const buscarTipo = async (req, res, next) => {
    try {
        const user = await usuario.findById(req.session.userId);
        if (user) {
            req.session.tipo = user.tipo; // Armazena o tipo de usuário na sessão
        }
        next();
    } catch (error) {
        console.error('Erro ao buscar usuário no banco de dados:', error);
        req.flash('error_msg', 'Ocorreu um erro. Tente novamente.');
        res.redirect('/login');
    }
};

module.exports = {
    verificarAutenticacao,
    verificarAutorizacao,
    buscarTipo,
};

// Exemplo de como usar os middlewares nas rotas
router.use(verificarAutenticacao);
router.use(buscarTipo);
