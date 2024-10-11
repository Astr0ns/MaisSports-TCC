const path = require('path');
var connection = require("../../config/pool_conexoes");
const upload = require('../models/upload-middleware');
// Renderiza o formulário de adicionar produto
const exibirFormularioProduto = (req, res) => {
    res.render('adicionarLocais'); // Certifique-se de que o nome da view corresponde ao seu arquivo EJS
};

// Adiciona um novo produto ao banco de dados
const adicionarProd = async (req, res) => {
    const { titulo_prod, descricao_prod, valor_prod, categoria_prod, tipo_prod, roupa_prod, link_prod} = req.body;

    try {

        // Insere o novo local
        const [addL] = await connection.query(
            `INSERT INTO produtos_das_empresas (titulo_prod, descricao_prod, categoria_prod, tipo_prod, roupa_prod, link_prod) VALUES (?, ?, ?, ?, ?, ?)`,
            [titulo_prod, descricao_prod, categoria_prod, tipo_prod, roupa_prod, link_prod]
        );

        const ProdId = addL.insertId;
        // Pegar a data de hoje no formato YYYY-MM-DD
        const dataHoje = new Date().toISOString().split('T')[0]; // Gera a data no formato YYYY-MM-DD


        const [addPreco] = await connection.query(
            `INSERT INTO preco_prod (fk_id_prod, valor_prod, ini_vig) VALUES (?, ?, ?)`,
            [ProdId, valor_prod, dataHoje]
        );

        // Armazena as imagens no banco de dados
        if (req.files && req.files.length > 0) {
            const imagens = req.files.map(file => file.filename);
            for (let imagem of imagens) {
                await connection.query(
                    `INSERT INTO imagens (fk_id_prod, nome_imagem) VALUES (?, ?)`,
                    [locaisId, imagem]
                );
            }
        }

        req.flash('success_msg', 'Local adicionado com sucesso!');

        // Redireciona após sucesso
        res.redirect('/add-product');

    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar Local: ' + error.message);
        console.log(error);
        res.redirect('/add-product');
    }
};


module.exports = {
    exibirFormularioProduto,
    adicionarProd,
};
