const express = require('express');
const { validationResult } = require("express-validator");
const router = express.Router();
const usuario = require("./usuarioModel");
const app = require('../../app');

// Middleware de autenticação
// middleware.js

const verificarAutenticacao = (req, res, next) => {
    if (req.session.userId) {
        req.session.logado = req.session.logado + 1;
        next();
    } else {
        req.session.logado = 0;
        res.redirect('/login'); // Redireciona se não estiver autenticado
    }
};

const verificarAutorizacao = (req, res, next) => {
    if (req.session.userId && req.session.userId === 'algumaCondicao') {
        req.session.userId = req.session.userId + 1;
        next(); // Usuário autorizado, continue
    } else {
        req.session.logado = 0;
        res.redirect('/register'); // Redireciona se não autorizado
    }
};

const verificarUsuAutorizado = (tipoPermitido, destinoFalha) => {
    return (req, res, next) => {
        if (
            req.session.userId &&
            tipoPermitido.includes(req.session.userId.tipo)
        ) {
            next();
        } else {
            res.render(destinoFalha, { userId: req.session.userId });
        }
    };
};

module.exports = {
    verificarAutenticacao,
    verificarAutorizacao,
    verificarUsuAutorizado
};
