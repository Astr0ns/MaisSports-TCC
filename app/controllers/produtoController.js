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

    const email = req.session.email;

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


const pegarProdutoEmpresa = async (req, res) => {

    try {
        

        // 1. Busca o ID do cliente (usuário) baseado no email
        const [user] = await connection.query(
            `SELECT id FROM empresas WHERE email = ?`,
            [email]
        );

        // Verifica se o usuário foi encontrado
        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const fk_id_emp = user[0].id;

        const [prod] = await connection.query(
            `SELECT id FROM empresas_produtos WHERE fk_id_emp = ?`,
            [fk_id_emp]
        );

        // Verifica se o usuário foi encontrado
        if (prod.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const fk_id_prod = prod[0].id;

        const query = `
            SELECT p.id_prod, p.titulo_prod, i.nome_imagem, AVG(a.avaliacao_estrela_prod) AS media_avaliacao, v.valor_prod 
            FROM produtos_das_empresas p 
            LEFT JOIN imagens i ON p.id_prod = i.fk_id_prod
            LEFT JOIN avaliacao_prod a ON p.id_prod = a.fk_id_prod  
            LEFT JOIN preco_prod v ON p.id_prod = v.fk_id_prod  
            WHERE p.id_prod = ?
            GROUP BY p.id_prod, i.nome_imagem
        `;
        const [results] = await connection.query(query, [fk_id_prod]); // Filtra pela categoria

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
    const prodId = Number(req.params.id); // Converter para número

    // Log para verificar se o email e o prodId estão corretos
    console.error("Email:", email, "Product ID:", prodId);

    try {
        // 1. Busca o ID do cliente (usuário) baseado no email
        const [user] = await connection.query(
            `SELECT id FROM usuario_clientes WHERE email = ?`,
            [email]
        );

        // Verifica se o usuário foi encontrado
        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const fk_id_cliente = user[0].id;
        console.log("ID do Cliente:", fk_id_cliente);

        // 2. Verifica se o produto existe na tabela de produtos
        const [product] = await connection.query(
            `SELECT id_prod FROM produtos_das_empresas WHERE id_prod = ?`,
            [prodId]
        );

        if (product.length === 0) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        // 3. Verifica se o produto já foi favoritado por esse usuário
        const [existingFavorite] = await connection.query(
            `SELECT * FROM favorito_produto WHERE fk_id_cliente = ? AND fk_id_prod = ?`,
            [fk_id_cliente, prodId]
        );

        console.log("Favorito existente:", existingFavorite);

        // Se o produto já foi favoritado, você pode optar por removê-lo ou retornar uma mensagem de erro
        if (existingFavorite.length > 0) {
            console.log("Produto já foi favoritado");

            // Aqui, removemos o produto dos favoritos
            await connection.query(
                `DELETE FROM favorito_produto WHERE fk_id_cliente = ? AND fk_id_prod = ?`,
                [fk_id_cliente, prodId]
            );

            return res.status(200).json({ message: 'Produto removido dos favoritos.' });
        }

        // 4. Insere o novo produto favoritado
        const [addL] = await connection.query(
            `INSERT INTO favorito_produto (fk_id_cliente, fk_id_prod) VALUES (?, ?)` ,
            [fk_id_cliente, prodId]
        );

        console.log("Produto favoritado com sucesso!");
        return res.status(200).json({ message: 'Produto favoritado com sucesso!' });

    } catch (error) {
        console.error("Erro ao favoritar produto:", error);
        return res.status(500).json({ message: 'Erro ao favoritar produto: ' + error.message });
    }
};





module.exports = {
    exibirFormularioProduto,
    adicionarProd, pegarProdutoBanco, getProductById, favoritarProd, pegarProdutoEmpresa,
};
