const express = require('express');
const router = express.Router();
const usuario = require("./usuarioModel");
// Crie uma instância do Router

// Middleware de autenticação (exemplo de uso)function verificarAutenticacao(req, res, next) {
verificarAutenticacao = (req, res, next) => {
    if (req.session.userId) {
        req.session.logado = req.session.logado + 1;
    } else {
        var userId = { userId: null, id: null, tipo: null };
        req.session.logado = 0;
        // UsuáriouserId, continue
    }
    req.session.userId = userId;
    next();
    res.redirect('/login'); // Redireciona se não estiveruserId
}

verificarAutorizacao = (req, res, next) => {
    if (req.session.userId && req.session.userId === 'algumaCondicao') {
        req.session.userIduserId = req.session.userIduserId + 1;
        return next(); // Usuário autorizado, continue
    } else {
        req.session.logado = req.session.logado = 0;
    }
    res.redirect('/register'); // Redireciona se não autorizado
}

verificarUsuAutorizado = (tipoPermitido, destinoFalha) => {
    return (req, res, next) => {
        if (
            req.session.userId.userId != null &&
            tipoPermitido.find(function (element) {
                return element == req.session.userId.tipo;
            }) != undefined
        ) {
            next();
        } else {
            res.render(destinoFalha, req.session.userId);
        }
    };
};
// Exporte o router e middleware
module.exports = {
    verificarAutenticacao,
    verificarAutorizacao
};