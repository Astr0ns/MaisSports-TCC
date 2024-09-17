const path = require('path');
var connection = require("../../config/pool_conexoes");
const upload = require('../models/upload-middleware'); // Middleware para upload

// Renderiza o formulário de adicionar produto
const exibirFormularioProduto = (req, res) => {
    res.render('adicionarLocais'); // Certifique-se de que o nome da view corresponde ao seu arquivo EJS
};

// Adiciona um novo produto ao banco de dados
const adicionarLocais = async (req, res) => {
    const { name, category, description } = req.body;
    const images = req.files;

    try {
        // Inserir informações do produto no banco de dados
        const [result] = await connection.query(
            `INSERT INTO produtos (nome, categoria, descricao)
             VALUES (?, ?, ?)`,
            [name, category, description]
        );

        const productId = result.insertId;

        // Inserir as imagens no banco de dados
        if (images) {
            for (const image of images) {
                await connection.query(
                    `INSERT INTO imagens_produtos (produto_id, caminho)
                     VALUES (?, ?)`,
                    [productId, image.path]
                );
            }
        }

        res.redirect('/adicionarProduto?success=true');
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        res.status(500).send('Erro ao adicionar produto.');
    }
};



module.exports = {
    exibirFormularioProduto,
    adicionarLocais
};
