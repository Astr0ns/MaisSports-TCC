const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const upload = require('../models/upload-middleware'); // Middleware para upload de arquivos

// Rota para exibir o formulário de adicionar produto
router.get('/adicionarLocais', produtoController.exibirFormularioProduto);

// Rota para processar o formulário de adicionar produto


module.exports = router;