const express = require('express');
const { validationResult } = require("express-validator");
const router = express.Router();
const usuario = require("./usuarioModel");
const app = require('../../app');
const flash = require('connect-flash');

// Middleware de autenticação
const verificarAutenticacao = (req, res, next) => {
    if (req.session.userId) {
        req.session.logado = req.session.logado ? req.session.logado + 1 : 1;
        next();
    } else {
        req.flash('error_msg', 'Você deve estar logado para acessar esta página.');
        req.session.logado = 0;
        res.redirect('/login'); // Redireciona se não estiver autenticado
    }
};

// Middleware para verificar autorização com base no tipo de usuário
const verificarAutorizacaoTipo = (tiposPermitidos, redirecionamento) => {
    return async (req, res, next) => {
        try {
            // Busca o usuário no banco de dados
            const user = await usuario.findById(req.session.userId);
            
            if (!user) {
                req.flash('error_msg', 'Usuário não encontrado.');
                return res.redirect('/login');
            }

            // Verifica se o tipo do usuário está nos tipos permitidos
            if (tiposPermitidos.includes(user.tipo)) {
                next(); // Usuário autorizado, continue
            } else {
                req.flash('error_msg', 'Você não tem permissão para acessar esta página.');
                res.redirect(redirecionamento); // Redireciona para a página de falha
            }
        } catch (error) {
            console.error('Erro ao buscar usuário no banco de dados:', error);
            req.flash('error_msg', 'Ocorreu um erro. Tente novamente.');
            res.redirect('/login');
        }
    };
};


module.exports = {
    verificarAutenticacao,
    verificarAutorizacaoTipo,
};
