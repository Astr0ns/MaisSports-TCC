const express = require('express');
const router = express.Router(); // Crie uma instância do Router

// Middleware de autenticação
function verificarAutenticacao(req, res, next) {
    if (req.session.userId) {
        return next(); // Usuário autenticado, continue
    }
    res.redirect('/login'); // Redireciona se não estiver autenticado
}

// Middleware de autorização (exemplo de uso)
function verificarAutorizacao(req, res, next) {
    if (req.session.userId && req.session.userId === 'algumaCondicao') {
        return next(); // Usuário autorizado, continue
    }
    res.redirect('/unauthorized'); // Redireciona se não autorizado
}

// Exporte o router e middleware
module.exports = {
    verificarAutenticacao,
    verificarAutorizacao
};