const path = require('path');
var connection = require("../../config/pool_conexoes");
const multer = require('multer');
const { MercadoPagoConfig, Preference } = require('mercadopago'); // Import Preference
const { all } = require('../routes/productRouter');

// Inicialize o cliente Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: 'APP_USR-5246075068010463-102011-9f4c949634a04fdbbf0193af72dd4988-428968371',
    options: { timeout: 5000, idempotencyKey: 'abc' }
});

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
const adicionarProdSegredos = async (req, res) => {
    const { titulo_prod, descricao_prod, valor_prod, categoria_prod, tipo_prod, roupa_prod, link_prod, valorPlano,idPlano } = req.body;
    const email = req.session.email;
    console.log(req.files);
    const imagens = req.files.map(file => file.filename); // Obtem os nomes dos arquivos de imagem
    console.log(valorPlano, idPlano)
    try {
        // Obtém o ID da empresa
        const [user] = await connection.query(
            `SELECT id FROM empresas WHERE email = ?`,
            [email]
        );

        const fk_id_emp = user[0].id; // Atribuindo fk_id_emp

        // Insira o novo produto na tabela
        const [addL] = await connection.query(
            `INSERT INTO produtos_das_empresas (titulo_prod, descricao_prod, categoria_prod, tipo_prod, roupa_prod, link_prod) VALUES (?, ?, ?, ?, ?, ?)`,
            [titulo_prod, descricao_prod, categoria_prod, tipo_prod, roupa_prod, link_prod]
        );

        const ProdId = addL.insertId; // Obtém o ID do produto recém-adicionado
        const dataHoje = new Date().toISOString().split('T')[0];

        // Insere o valor do produto na tabela de preços
        await connection.query(
            `INSERT INTO preco_prod (fk_id_prod, valor_prod, ini_vig) VALUES (?, ?, ?)`,
            [ProdId, valor_prod, dataHoje]
        );

        // Linka o produto com a empresa
        await connection.query(
            `INSERT INTO empresas_produtos (fk_id_emp, fk_id_prod) VALUES (?, ?)`,
            [fk_id_emp, ProdId]
        );

        for (let imagem of imagens) {
            await connection.query(
                `INSERT INTO imagens (fk_id_prod, nome_imagem) VALUES (?, ?)`,
                [ProdId, imagem]
            );
        }

        await connection.query(
            `INSERT INTO planos (fk_id_emp, fk_id_prod, title_plano) VALUES (?, ?, ?)`,
            [fk_id_emp, ProdId, "Basico"]
        );

        // Se houver imagens, insira-as
        
        
     

        req.flash('success_msg', 'Produto adicionado com sucesso!');
        res.redirect(`product-page/${ProdId}`);
    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar produto: ' + error.message);
        console.log(error);
        res.redirect('/add-product');
    }
};

const adicionarProd = async (req, res) => {
    const { titulo_prod, descricao_prod, valor_prod, categoria_prod, tipo_prod, roupa_prod, link_prod, valorPlano,idPlano } = req.body;
    const email = req.session.email;
    console.log(req.files);
    const imagens = req.files.map(file => file.filename); // Obtem os nomes dos arquivos de imagem
    console.log(valorPlano, idPlano)

    // Converter idPlano e valorPlano para números
const idPlanoNum = parseInt(idPlano, 10); // 10 é a base numérica
const valorPlanoNum = parseFloat(valorPlano); // Para números decimais

    let titlePlano;

if (idPlanoNum === 1) {
    titlePlano = "Black"; // Assign value to titlePlano
} else if (idPlanoNum === 2) {
    titlePlano = "Medio"; // Assign value to titlePlano
} else if (idPlanoNum === 3) {
    titlePlano = "Basico"; // Assign value to titlePlano
}
    console.log(titlePlano)


    console.log('Título:', titulo_prod);
    const externalReference = JSON.stringify({
        email,
        titulo_prod,
        descricao_prod,
        valor_prod,
        categoria_prod,
        tipo_prod,
        roupa_prod,
        link_prod,
        imagens,
        titlePlano,
        valorPlanoNum,
        idPlanoNum
    });

    try {
        // Inicialize o objeto de pagamento
        const preference = new Preference(client);

        // Crie o corpo da requisição de pagamento com dados vindos do cliente (ex: frontend)
        const body = {
            items: [
                {
                    id: `plano_${idPlanoNum}`,
                    title: `Plano ${titlePlano}`,
                    description: 'Plano +Sport',
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: valorPlanoNum,
                }
                
            ],
            back_urls: {
                success: `https://fuzzy-computing-machine-g47rjr6rr7qxfp6r-3000.app.github.dev/produto-confirmado`, // URL para sucesso
                failure: `https://fuzzy-computing-machine-g47rjr6rr7qxfp6r-3000.app.github.dev/adicionar-produto-falha`, // URL para falha
                pending: `https://fuzzy-computing-machine-g47rjr6rr7qxfp6r-3000.app.github.dev/adicionar-produto-pendente`, // URL para pendente
            },
            auto_return: all,
            external_reference: externalReference // Armazena os dados aqui
        };

        // Faça a requisição de pagamento
        const response = await preference.create({ body });
        // Retorne a resposta para o frontend
        
        res.redirect(response.init_point);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment processing failed' });
    }
};

const adicionarProdutoConfirmado = async (req, res) => {
    function pegarFimData(idPlanoNum, dataHoje) {
        const hoje = new Date(dataHoje);
        let diasParaAdicionar;
    
        switch (idPlanoNum) {
            case 1:
                diasParaAdicionar = 7;
                break;
            case 2:
                diasParaAdicionar = 30;
                break;
            case 3:
                diasParaAdicionar = 60;
                break;
            default:
                throw new Error('ID do plano inválido');
        }
    
        hoje.setDate(hoje.getDate() + diasParaAdicionar);
        return hoje.toISOString().split('T')[0]; // Retorna a data no formato YYYY-MM-DD
    }
    const paymentId = req.query.payment_id; // ID do pagamento
    const payment_status = req.query.status; // Status do pagamento
    const externalReference = req.query.external_reference;

    const produto = JSON.parse(externalReference);
    const { titulo_prod, descricao_prod, valor_prod, categoria_prod, tipo_prod, roupa_prod, link_prod, imagens, titlePlano, valorPlanoNum, idPlanoNum} = produto;

    try {
        // Obtém o ID da empresa
        const [user] = await connection.query(
            `SELECT id FROM empresas WHERE email = ?`,
            [email]
        );

        const fk_id_emp = user[0].id; // Atribuindo fk_id_emp

        // Insira o novo produto na tabela
        const [addL] = await connection.query(
            `INSERT INTO produtos_das_empresas (titulo_prod, descricao_prod, categoria_prod, tipo_prod, roupa_prod, link_prod) VALUES (?, ?, ?, ?, ?, ?)`,
            [titulo_prod, descricao_prod, categoria_prod, tipo_prod, roupa_prod, link_prod]
        );

        const ProdId = addL.insertId; // Obtém o ID do produto recém-adicionado
        const dataHoje = new Date().toISOString().split('T')[0];
        const dataFinal = pegarFimData(idPlanoNum,dataHoje)

        // Insere o valor do produto na tabela de preços
        await connection.query(
            `INSERT INTO preco_prod (fk_id_prod, valor_prod, ini_vig) VALUES (?, ?, ?)`,
            [ProdId, valor_prod, dataHoje]
        );

        // Se houver imagens, insira-as
        
        for (let imagem of imagens) {
            await connection.query(
                `INSERT INTO imagens (fk_id_prod, nome_imagem) VALUES (?, ?)`,
                [ProdId, imagem]
            );
        }

        // Linka o produto com a empresa
        await connection.query(
            `INSERT INTO empresas_produtos (fk_id_emp, fk_id_prod) VALUES (?, ?)`,
            [fk_id_emp, ProdId]
        );

        await connection.query(
            `INSERT INTO planos (fk_id_emp, fk_id_prod, title_plano, valor_plano, ini_vig, fim_vig) VALUES (?, ?, ?, ?, ?, ?)`,
            [fk_id_emp, ProdId, titlePlano, valorPlanoNum, dataHoje, dataFinal]
        );

        
     

        req.flash('success_msg', 'Produto adicionado com sucesso!');
        res.redirect(`product-page/${ProdId}`);
    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar produto: ' + error.message);
        console.log(error);
        res.redirect('/add-product');
    }
};


const pegarProdutoBanco = async (req, res) => {
    try {
        const query = `
            SELECT p.id_prod, p.titulo_prod, i.nome_imagem, i.ordem_img, AVG(a.avaliacao_estrela_prod) AS media_avaliacao, v.valor_prod 
            FROM produtos_das_empresas p 
            LEFT JOIN imagens i ON p.id_prod = i.fk_id_prod
            LEFT JOIN avaliacao_prod a ON p.id_prod = a.fk_id_prod  
            LEFT JOIN preco_prod v ON p.id_prod = v.fk_id_prod  
            GROUP BY p.id_prod, i.nome_imagem, i.ordem_img
            ORDER BY p.id_prod, i.ordem_img
        `;
        const [results] = await connection.query(query);

        const produtos = results.reduce((acc, row) => {
            const { id_prod, titulo_prod, valor_prod, nome_imagem, media_avaliacao } = row;
            const produto = acc.find(prod => prod.id_prod === id_prod);
            if (produto) {
                if (nome_imagem) {
                    produto.imagens.push(nome_imagem);
                }
            } else {
                acc.push({
                    id_prod,
                    titulo_prod,
                    valor_prod,
                    imagens: nome_imagem ? [nome_imagem] : [],
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
    const email = req.session.email;

    try {
        const [user] = await connection.query(`SELECT id FROM empresas WHERE email = ?`, [email]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const fk_id_emp = user[0].id;
        const [prod] = await connection.query(`SELECT id FROM empresas_produtos WHERE fk_id_emp = ?`, [fk_id_emp]);
        if (prod.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const fk_id_prod = prod[0].id;

        const query = `
            SELECT p.id_prod, p.titulo_prod, i.nome_imagem, i.ordem_img, AVG(a.avaliacao_estrela_prod) AS media_avaliacao, v.valor_prod 
            FROM produtos_das_empresas p 
            LEFT JOIN imagens i ON p.id_prod = i.fk_id_prod
            LEFT JOIN avaliacao_prod a ON p.id_prod = a.fk_id_prod  
            LEFT JOIN preco_prod v ON p.id_prod = v.fk_id_prod  
            WHERE p.id_prod = ?
            GROUP BY p.id_prod, i.nome_imagem, i.ordem_img
            ORDER BY i.ordem_img
        `;
        const [results] = await connection.query(query, [fk_id_prod]);

        const produtos = results.reduce((acc, row) => {
            const { id_prod, titulo_prod, valor_prod, nome_imagem, media_avaliacao } = row;
            const produto = acc.find(prod => prod.id_prod === id_prod);
            if (produto) {
                if (nome_imagem) {
                    produto.imagens.push(nome_imagem);
                }
            } else {
                acc.push({
                    id_prod,
                    titulo_prod,
                    valor_prod,
                    imagens: nome_imagem ? [nome_imagem] : [],
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


const pegarProdutoCurtido = async (req, res) => {

    const email = req.session.email;

    // Log para verificar se o email e o prodId estão corretos
    console.error("Email:", email);

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

        const fk_id_user = user[0].id;

        const [prod] = await connection.query(
            `SELECT fk_id_prod FROM favorito_produto WHERE fk_id_cliente = ?`,
            [fk_id_user]
        );

        // Verifica se o usuário foi encontrado
        if (prod.length === 0) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        const fk_id_prod = prod[0].fk_id_prod;

        const query = `
       

            SELECT c.fk_id_prod, p.id_prod, p.titulo_prod, i.nome_imagem, i.ordem_img, AVG(a.avaliacao_estrela_prod) AS media_avaliacao, v.valor_prod 
            FROM favorito_produto c
            
            LEFT JOIN produtos_das_empresas p ON c.fk_id_prod = p.id_prod
            LEFT JOIN imagens i ON p.id_prod = i.fk_id_prod
            LEFT JOIN avaliacao_prod a ON p.id_prod = a.fk_id_prod  
            LEFT JOIN preco_prod v ON p.id_prod = v.fk_id_prod  
            WHERE c.fk_id_cliente = ?
            GROUP BY p.id_prod, i.nome_imagem, i.ordem_img
            ORDER BY i.ordem_img

        `;
        const [results] = await connection.query(query, [fk_id_user]); // Filtra pelos favoritos

        // Formata os resultados para agrupar imagens por local
        const produtos = results.reduce((acc, row) => {
            const { id_prod, titulo_prod, valor_prod, nome_imagem, media_avaliacao } = row;
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
                    imagens: nome_imagem ? [nome_imagem] : [], // Inicia array de imagens
                    media_avaliacao
                });
            }
            return acc;
        }, []);

        // Ordena as imagens de cada produto de acordo com a ordem definida
        produtos.forEach(produto => {
            produto.imagens.sort((a, b) => {
                const ordemA = results.find(row => row.nome_imagem === a).ordem_img;
                const ordemB = results.find(row => row.nome_imagem === b).ordem_img;
                return ordemA - ordemB;
            });
        });
        
        console.log(produtos)

        res.json(produtos);
    } catch (error) {
        console.error("Erro ao buscar locais do banco de dados:", error);
        res.status(500).send("Erro ao buscar locais");
    }
};

// Modificando a função getProductById para aceitar o caminho como parâmetro
const getProductById = (path) => {
    return async (req, res) => {
        const prodId = req.params.id;
        const email = req.session.email; // Pega o email da sessão, se estiver definido
        try {
            const query = `
                SELECT p.id_prod, p.titulo_prod, p.descricao_prod, p.link_prod, i.nome_imagem, i.ordem_img, AVG(a.avaliacao_estrela_prod) AS media_avaliacao, v.valor_prod 
                FROM produtos_das_empresas p 
                LEFT JOIN imagens i ON p.id_prod = i.fk_id_prod
                LEFT JOIN avaliacao_prod a ON p.id_prod = a.fk_id_prod  
                LEFT JOIN preco_prod v ON p.id_prod = v.fk_id_prod  
                WHERE p.id_prod = ?
                GROUP BY p.id_prod, i.nome_imagem, i.ordem_img
                ORDER BY i.ordem_img
            `;
            const [results] = await connection.query(query, [prodId]);

            const produtos = results.reduce((acc, row) => {
                const { id_prod, titulo_prod, descricao_prod, link_prod, valor_prod, nome_imagem, media_avaliacao } = row;
                const produto = acc.find(prod => prod.id_prod === id_prod);
                if (produto) {
                    if (nome_imagem) {
                        produto.imagens.push(nome_imagem);
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
                console.log(produtos[0])
                res.render("pages/product-page", { product: produtos[0], email: email }); // Usa o caminho passado
            } else {
                res.status(404).send("Produto não encontrado");
            }
        } catch (error) {
            console.error("Erro ao buscar o produto no banco de dados:", error);
            res.status(500).send("Erro ao buscar o produto");
        }
    };
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

        
        // Se o produto já foi favoritado, desfavorita-o
        if (existingFavorite.length > 0) {
            console.log("Produto já foi favoritado, desfavoritando...");
            
            // Remove o produto da lista de favoritos
            await connection.query(
                `DELETE FROM favorito_produto WHERE fk_id_cliente = ? AND fk_id_prod = ?`,
                [fk_id_cliente, prodId]
            );
            
            return res.status(200).json({ message: 'Produto desfavoritado com sucesso.' });
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
        return res.status(500).json({ message: 'Erro ao favoritar produtos: ' + error.message });
    }
};





module.exports = {
    exibirFormularioProduto, adicionarProdSegredos,
    adicionarProd, pegarProdutoBanco, getProductById, favoritarProd, pegarProdutoEmpresa, adicionarProdutoConfirmado, pegarProdutoCurtido,
};
