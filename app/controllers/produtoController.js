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


const pegarProdutoBanco = async (req, res) => {
    const { categoria } = req.query; // Pega a categoria da query string

    try {
        const query = `
            SELECT l.id, l.nome_local, l.latitude, l.longitude, i.nome_imagem, AVG(a.avaliacao_estrela_locais) AS media_avaliacao
            FROM locais l 
            LEFT JOIN imagens i ON l.id = i.fk_local_id
            LEFT JOIN avaliacao_local a ON l.id = a.fk_id_local  
            WHERE l.categoria = ?
            GROUP BY l.id, i.nome_imagem
        `;
        const [results] = await connection.query(query, [categoria]); // Filtra pela categoria

        // Formata os resultados para agrupar imagens por local
        const formattedResults = results.reduce((acc, row) => {
            const { id, nome_local, latitude, longitude, nome_imagem, media_avaliacao } = row;
            const local = acc.find(loc => loc.id === id); // Procura pelo ID único
            if (local) {
                if (nome_imagem) {
                    local.imagens.push(nome_imagem);
                }
            } else {
                acc.push({
                    id,
                    nome_local,
                    latitude,
                    longitude,
                    imagens: nome_imagem ? [nome_imagem] : [], // Inicia array de imagens
                    media_avaliacao
                });
            }
            return acc;
        }, []);

        res.json(formattedResults);
    } catch (error) {
        console.error("Erro ao buscar locais do banco de dados:", error);
        res.status(500).send("Erro ao buscar locais");
    }
};


module.exports = {
    exibirFormularioProduto,
    adicionarProd, pegarProdutoBanco,
};
