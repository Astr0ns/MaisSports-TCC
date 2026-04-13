const connection = require("../../config/pool_conexoes");
const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({
    accessToken: 'TEST-5246075068010463-102011-23539c46def1acb4b061770a6d174e1e-428968371',
    options: { timeout: 5000, idempotencyKey: 'abc' }
});

const exibirFormularioProduto = (req, res) => {
    res.render('adicionarLocais');
};

const adicionarProdSegredos = async (req, res) => {
    const { titulo_prod, descricao_prod, valor_prod, categoria_prod, tipo_prod, roupa_prod, link_prod } = req.body;
    const email = req.session.email;
    const imagens = req.files.map(file => file.filename);

    try {
        const user = await connection.query("SELECT id FROM empresas WHERE email = $1", [email]);
        const fk_id_emp = user.rows[0].id;

        const addL = await connection.query(
            "INSERT INTO produtos_das_empresas (titulo_prod, descricao_prod, categoria_prod, tipo_prod, roupa_prod, link_prod) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [titulo_prod, descricao_prod, categoria_prod, tipo_prod, roupa_prod, link_prod]
        );
        const ProdId = addL.rows[0].id;
        const dataHoje = new Date().toISOString().split('T')[0];

        await connection.query("INSERT INTO preco_prod (fk_id_prod, valor_prod, ini_vig) VALUES ($1, $2, $3)", [ProdId, valor_prod, dataHoje]);
        await connection.query("INSERT INTO empresas_produtos (fk_id_emp, fk_id_prod) VALUES ($1, $2)", [fk_id_emp, ProdId]);

        for (let imagem of imagens) {
            await connection.query("INSERT INTO imagens (fk_id_prod, nome_imagem) VALUES ($1, $2)", [ProdId, imagem]);
        }

        req.flash('success_msg', 'Produto adicionado com sucesso!');
        res.redirect(`product-page/${ProdId}`);
    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar produto: ' + error.message);
        console.log(error);
        res.redirect('/add-product');
    }
};

const adicionarProd = async (req, res) => {
    const { titulo_prod, descricao_prod, valor_prod, categoria_prod, tipo_prod, roupa_prod, link_prod, valorPlano, idPlano } = req.body;
    const email = req.session.email;
    const imagens = req.files.map(file => file.filename);

    const idPlanoNum = parseInt(idPlano, 10);
    const valorPlanoNum = parseFloat(valorPlano);

    let titlePlano;
    if (idPlanoNum === 1) titlePlano = "Black";
    else if (idPlanoNum === 2) titlePlano = "Medio";
    else if (idPlanoNum === 3) titlePlano = "Basico";

    const externalReference = JSON.stringify({
        email, titulo_prod, descricao_prod, valor_prod, categoria_prod,
        tipo_prod, roupa_prod, link_prod, imagens, titlePlano, valorPlanoNum, idPlanoNum
    });

    try {
        const preference = new Preference(client);
        const body = {
            items: [{
                id: `plano_${idPlanoNum}`,
                title: `Plano ${titlePlano}`,
                description: 'Plano +Sport',
                quantity: 1,
                currency_id: 'BRL',
                unit_price: valorPlanoNum,
            }],
            back_urls: {
                success: `https://maissports-tcc.onrender.com/produto-confirmado`,
                failure: `https://maissports-tcc.onrender.com/produto-confirmado`,
                pending: `https://maissports-tcc.onrender.com/produto-confirmado`,
            },
            auto_return: 'approved',
            external_reference: externalReference
        };

        const response = await preference.create({ body });
        res.redirect(response.init_point);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment processing failed' });
    }
};

const adicionarProdutoConfirmado = async (req, res) => {
    function pegarFimData(idPlanoNum, dataHoje) {
        const hoje = new Date(dataHoje);
        const dias = idPlanoNum === 1 ? 7 : idPlanoNum === 2 ? 30 : 60;
        hoje.setDate(hoje.getDate() + dias);
        return hoje.toISOString().split('T')[0];
    }

    const externalReference = req.query.external_reference;
    const produto = JSON.parse(externalReference);
    const { email, titulo_prod, descricao_prod, valor_prod, categoria_prod, tipo_prod, roupa_prod, link_prod, imagens, titlePlano, valorPlanoNum, idPlanoNum } = produto;

    try {
        const user = await connection.query("SELECT id FROM empresas WHERE email = $1", [email]);
        const fk_id_emp = user.rows[0].id;

        const addL = await connection.query(
            "INSERT INTO produtos_das_empresas (titulo_prod, descricao_prod, categoria_prod, tipo_prod, roupa_prod, link_prod) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [titulo_prod, descricao_prod, categoria_prod, tipo_prod, roupa_prod, link_prod]
        );
        const ProdId = addL.rows[0].id;
        const dataHoje = new Date().toISOString().split('T')[0];
        const dataFinal = pegarFimData(idPlanoNum, dataHoje);

        await connection.query("INSERT INTO preco_prod (fk_id_prod, valor_prod, ini_vig) VALUES ($1, $2, $3)", [ProdId, valor_prod, dataHoje]);
        await connection.query("INSERT INTO empresas_produtos (fk_id_emp, fk_id_prod) VALUES ($1, $2)", [fk_id_emp, ProdId]);

        for (let imagem of imagens) {
            await connection.query("INSERT INTO imagens (fk_id_prod, nome_imagem) VALUES ($1, $2)", [ProdId, imagem]);
        }

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
            SELECT p.id, p.titulo_prod, i.nome_imagem, i.ordem_img, 
                   AVG(a.avaliacao_estrela_prod) AS media_avaliacao, v.valor_prod 
            FROM produtos_das_empresas p 
            LEFT JOIN imagens i ON p.id = i.fk_id_prod
            LEFT JOIN avaliacao_prod a ON p.id = a.fk_id_prod  
            LEFT JOIN preco_prod v ON p.id = v.fk_id_prod  
            GROUP BY p.id, i.nome_imagem, i.ordem_img, v.valor_prod
            ORDER BY p.id, i.ordem_img
        `;
        const result = await connection.query(query);

        const produtos = result.rows.reduce((acc, row) => {
            const { id, titulo_prod, valor_prod, nome_imagem, media_avaliacao } = row;
            const produto = acc.find(prod => prod.id === id);
            if (produto) {
                if (nome_imagem) produto.imagens.push(nome_imagem);
            } else {
                acc.push({ id, titulo_prod, valor_prod, imagens: nome_imagem ? [nome_imagem] : [], media_avaliacao });
            }
            return acc;
        }, []);

        res.json(produtos);
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.status(500).send("Erro ao buscar produtos");
    }
};

const pegarProdutoEmpresa = async (req, res) => {
    const email = req.session.email;

    try {
        const user = await connection.query("SELECT id FROM empresas WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(404).json({ message: 'Empresa não encontrada.' });

        const fk_id_emp = user.rows[0].id;
        const prod = await connection.query("SELECT fk_id_prod FROM empresas_produtos WHERE fk_id_emp = $1", [fk_id_emp]);
        if (prod.rows.length === 0) return res.status(404).json({ message: 'Produto não encontrado.' });

        const fk_id_prod = prod.rows[0].fk_id_prod;

        const query = `
            SELECT p.id, p.titulo_prod, i.nome_imagem, i.ordem_img,
                   AVG(a.avaliacao_estrela_prod) AS media_avaliacao, v.valor_prod 
            FROM produtos_das_empresas p 
            LEFT JOIN imagens i ON p.id = i.fk_id_prod
            LEFT JOIN avaliacao_prod a ON p.id = a.fk_id_prod  
            LEFT JOIN preco_prod v ON p.id = v.fk_id_prod  
            WHERE p.id = $1
            GROUP BY p.id, i.nome_imagem, i.ordem_img, v.valor_prod
            ORDER BY i.ordem_img
        `;
        const result = await connection.query(query, [fk_id_prod]);

        const produtos = result.rows.reduce((acc, row) => {
            const { id, titulo_prod, valor_prod, nome_imagem, media_avaliacao } = row;
            const produto = acc.find(p => p.id === id);
            if (produto) {
                if (nome_imagem) produto.imagens.push(nome_imagem);
            } else {
                acc.push({ id, titulo_prod, valor_prod, imagens: nome_imagem ? [nome_imagem] : [], media_avaliacao });
            }
            return acc;
        }, []);

        res.json(produtos);
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        res.status(500).send("Erro ao buscar produtos");
    }
};

const pegarProdutoCurtido = async (req, res) => {
    const email = req.session.email;

    try {
        const user = await connection.query("SELECT id FROM usuario_clientes WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const fk_id_user = user.rows[0].id;

        const query = `
            SELECT c.fk_id_prod, p.id, p.titulo_prod, i.nome_imagem, i.ordem_img,
                   AVG(a.avaliacao_estrela_prod) AS media_avaliacao, v.valor_prod 
            FROM favorito_produto c
            LEFT JOIN produtos_das_empresas p ON c.fk_id_prod = p.id
            LEFT JOIN imagens i ON p.id = i.fk_id_prod
            LEFT JOIN avaliacao_prod a ON p.id = a.fk_id_prod  
            LEFT JOIN preco_prod v ON p.id = v.fk_id_prod  
            WHERE c.fk_id_cliente = $1
            GROUP BY c.fk_id_prod, p.id, i.nome_imagem, i.ordem_img, v.valor_prod
            ORDER BY i.ordem_img
        `;
        const result = await connection.query(query, [fk_id_user]);

        const produtos = result.rows.reduce((acc, row) => {
            const { id, titulo_prod, valor_prod, nome_imagem, media_avaliacao } = row;
            const produto = acc.find(p => p.id === id);
            if (produto) {
                if (nome_imagem) produto.imagens.push(nome_imagem);
            } else {
                acc.push({ id, titulo_prod, valor_prod, imagens: nome_imagem ? [nome_imagem] : [], media_avaliacao });
            }
            return acc;
        }, []);

        res.json(produtos);
    } catch (error) {
        console.error("Erro ao buscar produtos curtidos:", error);
        res.status(500).send("Erro ao buscar produtos");
    }
};

const getProductById = (path) => {
    return async (req, res) => {
        const prodId = req.params.id;
        const email = req.session.email;
        try {
            const query = `
                SELECT p.id, p.titulo_prod, p.descricao_prod, p.link_prod, i.nome_imagem, i.ordem_img,
                       AVG(a.avaliacao_estrela_prod) AS media_avaliacao, v.valor_prod 
                FROM produtos_das_empresas p 
                LEFT JOIN imagens i ON p.id = i.fk_id_prod
                LEFT JOIN avaliacao_prod a ON p.id = a.fk_id_prod  
                LEFT JOIN preco_prod v ON p.id = v.fk_id_prod  
                WHERE p.id = $1
                GROUP BY p.id, i.nome_imagem, i.ordem_img, v.valor_prod
                ORDER BY i.ordem_img
            `;
            const result = await connection.query(query, [prodId]);

            const produtos = result.rows.reduce((acc, row) => {
                const { id, titulo_prod, descricao_prod, link_prod, valor_prod, nome_imagem, media_avaliacao } = row;
                const produto = acc.find(p => p.id === id);
                if (produto) {
                    if (nome_imagem) produto.imagens.push(nome_imagem);
                } else {
                    acc.push({ id, titulo_prod, valor_prod, descricao_prod, link_prod, imagens: nome_imagem ? [nome_imagem] : [], media_avaliacao });
                }
                return acc;
            }, []);

            if (produtos.length > 0) {
                res.render("pages/product-page", { product: produtos[0], email: email });
            } else {
                res.status(404).send("Produto não encontrado");
            }
        } catch (error) {
            console.error("Erro ao buscar produto:", error);
            res.status(500).send("Erro ao buscar produto");
        }
    };
};

const favoritarProd = async (req, res) => {
    const email = req.session.email;
    const prodId = Number(req.params.id);

    try {
        const user = await connection.query("SELECT id FROM usuario_clientes WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const fk_id_cliente = user.rows[0].id;

        const product = await connection.query("SELECT id FROM produtos_das_empresas WHERE id = $1", [prodId]);
        if (product.rows.length === 0) return res.status(404).json({ message: 'Produto não encontrado.' });

        const existingFav = await connection.query(
            "SELECT * FROM favorito_produto WHERE fk_id_cliente = $1 AND fk_id_prod = $2",
            [fk_id_cliente, prodId]
        );

        if (existingFav.rows.length > 0) {
            await connection.query("DELETE FROM favorito_produto WHERE fk_id_cliente = $1 AND fk_id_prod = $2", [fk_id_cliente, prodId]);
            return res.status(200).json({ message: 'Produto desfavoritado com sucesso.' });
        }

        await connection.query("INSERT INTO favorito_produto (fk_id_cliente, fk_id_prod) VALUES ($1, $2)", [fk_id_cliente, prodId]);
        return res.status(200).json({ message: 'Produto favoritado com sucesso!' });

    } catch (error) {
        console.error("Erro ao favoritar produto:", error);
        return res.status(500).json({ message: 'Erro: ' + error.message });
    }
};

const verSeProdFav = async (req, res) => {
    const email = req.session.email;
    const prodId = Number(req.params.id);

    try {
        const user = await connection.query("SELECT id FROM usuario_clientes WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const fk_id_cliente = user.rows[0].id;

        const existingFav = await connection.query(
            "SELECT * FROM favorito_produto WHERE fk_id_cliente = $1 AND fk_id_prod = $2",
            [fk_id_cliente, prodId]
        );

        if (existingFav.rows.length > 0) {
            return res.status(200).json({ message: 'Produto já favoritado.' });
        }

        return res.status(200).json({ message: 'Produto não favoritado.' });

    } catch (error) {
        console.error("Erro:", error);
        return res.status(500).json({ message: 'Erro: ' + error.message });
    }
};

module.exports = {
    exibirFormularioProduto, adicionarProdSegredos, adicionarProd,
    pegarProdutoBanco, getProductById, favoritarProd, pegarProdutoEmpresa,
    adicionarProdutoConfirmado, pegarProdutoCurtido, verSeProdFav,
};
