const path = require('path');
var connection = require("../../config/pool_conexoes");
const multer = require('multer');


// Configuração do armazenamento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Pasta onde as imagens serão salvas
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Renomeia o arquivo
    }
});

// Configuração do multer
const upload = multer({ storage: storage }).array('imagens', 4); // 'imagens' é o nome do campo no formulário, 4 é o limite



// Renderiza o formulário de adicionar produto
const exibirFormularioProduto = (req, res) => {
    res.render('adicionarLocais'); // Certifique-se de que o nome da view corresponde ao seu arquivo EJS
};

// Adiciona um novo produto ao banco de dados
const adicionarProd = async (req, res) => {
    const { titulo_prod, descricao_prod, valor_prod, categoria_prod, tipo_prod, roupa_prod, link_prod } = req.body;

    try {
        // Insere o novo produto
        const [addL] = await connection.query(
            `INSERT INTO produtos_das_empresas (titulo_prod, descricao_prod, categoria_prod, tipo_prod, roupa_prod, link_prod) VALUES (?, ?, ?, ?, ?, ?)`,
            [titulo_prod, descricao_prod, categoria_prod, tipo_prod, roupa_prod, link_prod]
        );

        const ProdId = addL.insertId; // Obtém o ID do produto recém-adicionado

        // Pega a data atual no formato YYYY-MM-DD
        const dataHoje = new Date().toISOString().split('T')[0];

        // Insere o valor do produto na tabela de preços
        await connection.query(
            `INSERT INTO preco_prod (fk_id_prod, valor_prod, ini_vig) VALUES (?, ?, ?)`,
            [ProdId, valor_prod, dataHoje]
        );

        // Verifica se existem arquivos enviados (imagens)
        if (req.files && req.files.length > 0) {
            const imagens = req.files.map(file => file.filename); // Obtem os nomes dos arquivos de imagem
            for (let imagem of imagens) {
                // Insere cada imagem no banco de dados, vinculando ao ID do produto
                await connection.query(
                    `INSERT INTO imagens (fk_id_prod, nome_imagem) VALUES (?, ?)`,
                    [ProdId, imagem]
                );
            }
        }

        req.flash('success_msg', 'Produto adicionado com sucesso!');
        res.redirect('/add-product');

    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar produto: ' + error.message);
        console.log(error);
        res.redirect('/add-product');
    }
};




const pegarProdutoBanco = async (req, res) => {

    try {
        const query = `
            SELECT p.id_prod, p.titulo_prod, i.nome_imagem, AVG(a.avaliacao_estrela_prod) AS media_avaliacao, v.valor_prod 
            FROM produtos_das_empresas p 
            LEFT JOIN imagens i ON p.id_prod = i.fk_id_prod
            LEFT JOIN avaliacao_prod a ON p.id_prod = a.fk_id_prod  
            LEFT JOIN preco_prod v ON p.id_prod = v.fk_id_prod  
            GROUP BY p.id_prod, i.nome_imagem
        `;
        const [results] = await connection.query(query); // Filtra pela categoria

        // Formata os resultados para agrupar imagens por local
        const produtos = results.reduce((acc, row) => {
            const { id_prod, titulo_prod, valor_prod, nome_imagem, media_avaliacao } = row; // Use os nomes corretos das colunas
            const produto = acc.find(prod => prod.id_prod === id_prod); // Procura pelo ID único do produto
            if (produto) {
                if (nome_imagem) {
                    produto.imagens.push(nome_imagem); // Adiciona a imagem se já existir o produto
                }
            } else {
                acc.push({
                    id_prod,
                    titulo_prod,
                    valor_prod,
                    imagens: nome_imagem ? [nome_imagem] : [], // Inicia array de imagens
                    media_avaliacao
                });
            }
            return acc;
        }, []);
        

        res.json(produtos);
    } catch (error) {
        console.error("Erro ao buscar locais do banco de dados:", error);
        res.status(500).send("Erro ao buscar locais");
    }
};

const getProductById = async (req, res) => {
    const prodId = req.params.id; // Pega o ID do produto dos parâmetros da URL
    const email = req.session.email; // Pega o email da sessão, se estiver definido

    try {
        const query = `
            SELECT p.id_prod, p.titulo_prod, p.descricao_prod, p.link_prod, i.nome_imagem, AVG(a.avaliacao_estrela_prod) AS media_avaliacao, v.valor_prod 
            FROM produtos_das_empresas p 
            LEFT JOIN imagens i ON p.id_prod = i.fk_id_prod
            LEFT JOIN avaliacao_prod a ON p.id_prod = a.fk_id_prod  
            LEFT JOIN preco_prod v ON p.id_prod = v.fk_id_prod  
            WHERE p.id_prod = ?
            GROUP BY p.id_prod, i.nome_imagem
        `;
        const [results] = await connection.query(query, [prodId]);

        // Formata os resultados para agrupar imagens por produto
        const produtos = results.reduce((acc, row) => {
            const { id_prod, titulo_prod, descricao_prod, link_prod, valor_prod, nome_imagem, media_avaliacao } = row;
            const produto = acc.find(prod => prod.id_prod === id_prod);
            if (produto) {
                if (nome_imagem) {
                    produto.imagens.push(nome_imagem); // Adiciona a imagem se já existir o produto
                }
            } else {
                acc.push({
                    id_prod,
                    titulo_prod,
                    valor_prod,
                    descricao_prod,
                    link_prod,
                    imagens: nome_imagem ? [nome_imagem] : [],
                    media_avaliacao
                });
            }
            return acc;
        }, []);

        if (produtos.length > 0) {
            res.render("pages/product-page", { product: produtos[0], email: email }); // Agora usa produtos[0]
        } else {
            res.status(404).send("Produto não encontrado");
        }
    } catch (error) {
        console.error("Erro ao buscar o produto no banco de dados:", error);
        res.status(500).send("Erro ao buscar o produto");
    }
};



const favoritarProd = async (req, res) => {
    const email = req.session.email;
    const prodId = req.params.id;
    console.error(email, prodId);

    try {
        // 1. Busca o ID do cliente (usuario) baseado no email
        const [user] = await connection.query(
            `SELECT id FROM usuario_clientes WHERE email = ?`,
            [email]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const fk_id_cliente = user[0].id;
        console.log(fk_id_cliente);

        // Verifica se o produto já foi favoritado
        const [existingFavorite] = await connection.query(
            `SELECT * FROM favorito_produto WHERE fk_id_cliente = ? AND fk_id_prod = ?`,
            [fk_id_cliente, prodId]
            
        );
        console.log(existingFavorite);

        if (existingFavorite.length > 0) {
            return res.status(400).json({ message: 'Produto já foi favoritado.' });
            console.log("favoritado");
        }

        // Insere o novo produto favoritado
        const [addL] = await connection.query(
            `INSERT INTO favorito_produto (fk_id_cliente, fk_id_prod) VALUES (?, ?)` ,
            [fk_id_cliente, prodId]
        );

        return res.status(200).json({ message: 'Produto favoritado com sucesso!' });
        console.log("certo");

    } catch (error) {
        return res.status(500).json({ message: 'Erro ao favoritar produto: ' + error.message });
        console.log("erro no banco");
    }
};



module.exports = {
    exibirFormularioProduto,
    adicionarProd, pegarProdutoBanco, getProductById, favoritarProd,
};
