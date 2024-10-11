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
        // Verifica se o local já existe
        const [endExist] = await connection.query(
            "SELECT * FROM locais WHERE latitude = ? AND longitude = ?",
            [latitude, longitude]
        );

        if (endExist.length > 0) {
            req.flash('error_msg', 'Esse endereço já foi adicionado ao Sports Map.');
            return res.redirect('/add-product');
        }

        // Insere o novo local
        const [addL] = await connection.query(
            `INSERT INTO locais (nome_local, categoria, descricao, latitude, longitude) VALUES (?, ?, ?, ?, ?)`,
            [nome_local, categoria, descricao, latitude, longitude]
        );

        const locaisId = addL.insertId;

        // Armazena as imagens no banco de dados
        if (req.files && req.files.length > 0) {
            const imagens = req.files.map(file => file.filename);
            for (let imagem of imagens) {
                await connection.query(
                    `INSERT INTO imagens (fk_local_id, nome_imagem) VALUES (?, ?)`,
                    [locaisId, imagem]
                );
            }
        }

        req.flash('success_msg', 'Local adicionado com sucesso!');
        req.session.nome = nome;

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
