const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const upload = require('../models/upload-middleware'); // Middleware para upload de arquivos

// Rota para exibir o formulário de adicionar produto
router.get('/adicionarLocais', produtoController.exibirFormularioProduto);

// Rota para processar o formulário de adicionar produto


module.exports = router;

const adicionarProdutoConfirmado = async (req, res) => {
    // Verifique se a transação foi confirmada (você pode fazer isso verificando um parâmetro de consulta ou um webhook)
    const { payment_status } = req.query; // Exemplo: como o status de pagamento é recebido

    if (payment_status === 'approved') {
        const produtoTemp = req.session.produtoTemp;
        const email = req.session.email;

        try {
            // Insira o novo produto na tabela
            const [addL] = await connection.query(
                `INSERT INTO produtos_das_empresas (titulo_prod, descricao_prod, categoria_prod, tipo_prod, roupa_prod, link_prod) VALUES (?, ?, ?, ?, ?, ?)`,
                [produtoTemp.titulo_prod, produtoTemp.descricao_prod, produtoTemp.categoria_prod, produtoTemp.tipo_prod, produtoTemp.roupa_prod, produtoTemp.link_prod]
            );

            const [user] = await connection.query(
                `SELECT id FROM empresas WHERE email = ?`,
                [email]
            );

            const fk_id_emp = user[0].id;
            const ProdId = addL.insertId; // Obtém o ID do produto recém-adicionado

            // Pega a data atual no formato YYYY-MM-DD
            const dataHoje = new Date().toISOString().split('T')[0];

            // Insere o valor do produto na tabela de preços
            await connection.query(
                `INSERT INTO preco_prod (fk_id_prod, valor_prod, ini_vig) VALUES (?, ?, ?)`,
                [ProdId, produtoTemp.valor_prod, dataHoje]
            );

            // Linka o produto com a empresa
            await connection.query(
                `INSERT INTO empresas_produtos (fk_id_emp, fk_id_prod) VALUES (?, ?)`,
                [fk_id_emp, ProdId]
            );

            // Se houver imagens, insira-as
            if (req.session.imagens) {
                for (let imagem of req.session.imagens) {
                    await connection.query(
                        `INSERT INTO imagens (fk_id_prod, nome_imagem) VALUES (?, ?)`,
                        [ProdId, imagem]
                    );
                }
            }

            req.flash('success_msg', 'Produto adicionado com sucesso!');
            // Limpa os dados da sessão
            delete req.session.produtoTemp;
            res.redirect('/add-product');
        } catch (error) {
            req.flash('error_msg', 'Erro ao adicionar produto: ' + error.message);
            console.log(error);
            res.redirect('/add-product');
        }
    } else {
        req.flash('error_msg', 'Pagamento não foi aprovado.');
        res.redirect('/add-product');
    }
};
