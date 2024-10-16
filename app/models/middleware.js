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
    const tipoUsuario = req.session.tipoUsuario; // Supondo que o tipo de usuário é armazenado na sessão

    // Verifica a rota acessada
    if (req.path === '/empresas' && tipoUsuario === 'usuario') {
        req.flash('error_msg', 'Usuários não têm permissão para acessar a página de empresas.');
        return res.redirect('/'); // Redireciona para a página inicial ou outra de sua escolha
    }

    if (req.path === '/profile' && tipoUsuario === 'empresa') {
        req.flash('error_msg', 'Empresas não têm permissão para acessar a página de perfil.');
        return res.redirect('/empresas'); // Redireciona para a página de empresas
    }

    next(); // Usuário autorizado, continue
};

// Middleware para buscar tipo de usuário no banco de dados e armazená-lo na sessão
const buscarTipoUsuario = async (req, res, next) => {
    try {
        const user = await usuario.findById(req.session.userId);
        if (user) {
            req.session.tipoUsuario = user.tipo; // Armazena o tipo de usuário na sessão
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
    buscarTipoUsuario,
};

// Exemplo de como usar os middlewares nas rotas
router.use(verificarAutenticacao);
router.use(buscarTipoUsuario);
