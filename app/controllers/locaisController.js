var connection = require("../../config/pool_conexoes");
const express = require('express');
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


const adicionarLocais = async (req, res) => {
    const { nome_local, local_category, desc_local, latitude, longitude } = req.body;

    try {
        // Verifica se o local já existe
        const [endExist] = await connection.query(
            "SELECT * FROM locais WHERE latitude = ? AND longitude = ?",
            [latitude, longitude]
        );

        if (endExist.length > 0) {
            req.flash('error_msg', 'Esse endereço já foi adicionado ao Sports Map.');
            return res.redirect('/locais-esportivos');
        }

        // Insere o novo local
        const [addL] = await connection.query(
            `INSERT INTO locais (nome_local, categoria, descricao, latitude, longitude) VALUES (?, ?, ?, ?, ?)`,
            [nome_local, local_category, desc_local, latitude, longitude]
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
        res.redirect('/locais-esportivos');

    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar Local: ' + error.message);
        console.log(error);
        res.redirect('/locais-esportivos');
    }
};

const avaliarLocais = async (req, res) => {
    const { placeId_google, rating, comentario, email } = req.body;
    console.log('req.body:', req.body);

    try {
        // 1. Busca o ID do cliente (usuario) baseado no email
        const [user] = await connection.query(
            `SELECT id FROM usuario_clientes WHERE email = ?`,
            [email]
        );

        console.log('Resultado da consulta de usuário:', user); // Verifica o resultado

        if (user.length === 0) {
            req.flash('error_msg', 'Usuário não encontrado.');
            return res.redirect('/add-locais'); // Adicione um return aqui
        }

        const fk_id_cliente = user[0].id; // Obtém o ID do cliente

        // 2. Insere a avaliação do local na tabela avaliacao_googleplaces
        const [addL] = await connection.query(
            `INSERT INTO avaliacao_googleplaces (fk_id_cliente, fk_id_google, comentario_local, avaliacao_estrela_locais) 
             VALUES (?, ?, ?, ?)`,
            [fk_id_cliente, placeId_google, comentario, rating]
        );

        // 3. Adiciona uma mensagem de sucesso e redireciona
        req.flash('success_msg', 'Avaliação adicionada com sucesso');
        res.redirect('/locais-esportivos');

    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar avaliação: ' + error.message);
        console.log(error);
        res.redirect('/locais-esportivos');
    }
};

const avaliarLocaisBanco = async (req, res) => {
    const { localId, rating, comentario, email } = req.body;
    console.log('req.body:', req.body);

    try {
        // 1. Busca o ID do cliente (usuario) baseado no email
        const [user] = await connection.query(
            `SELECT id FROM usuario_clientes WHERE email = ?`,
            [email]
        );

        console.log('Resultado da consulta de usuário:', user); // Verifica o resultado

        if (user.length === 0) {
            req.flash('error_msg', 'Usuário não encontrado.');
            return res.redirect('/add-locais'); // Adicione um return aqui
        }

        const fk_id_cliente = user[0].id; // Obtém o ID do cliente

        // 2. Insere a avaliação do local na tabela avaliacao_googleplaces
        const [addL] = await connection.query(
            `INSERT INTO avaliacao_local (fk_id_cliente, fk_id_local, comentario_local, avaliacao_estrela_locais) 
             VALUES (?, ?, ?, ?)`,
            [fk_id_cliente, localId, comentario, rating]
        );

        // 3. Adiciona uma mensagem de sucesso e redireciona
        req.flash('success_msg', 'Avaliação adicionada com sucesso');
        res.redirect('/locais-esportivos');

    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar avaliação: ' + error.message);
        console.log(error);
        res.redirect('/locais-esportivos');
    }
};



const locaisBanco = async (req, res) => {
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

const pegarLocaisCurtido = async (req, res) => {

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

        const [local] = await connection.query(
            `SELECT fk_id_local FROM favorito_locais WHERE fk_id_cliente = ? AND fk_id_local IS NOT NULL`,
            [fk_id_user]
        );
        

        if (local.length === 0) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        const fk_id_local = local[0].fk_id_local;


        const query = `
            SELECT l.id, l.nome_local, l.latitude, l.longitude, i.nome_imagem, i.ordem_img, AVG(a.avaliacao_estrela_locais) AS media_avaliacao
            FROM locais l 
            LEFT JOIN imagens i ON l.id = i.fk_local_id
            LEFT JOIN avaliacao_local a ON l.id = a.fk_id_local  
            WHERE l.id = ?
            GROUP BY l.id, i.nome_imagem, i.ordem_img
            ORDER BY i.ordem_img
        `;
        const [results] = await connection.query(query, [fk_id_local]); // Filtra pelos favoritos

        // Formata os resultados para agrupar imagens por local
        const locais = results.reduce((acc, row) => {
            const { id, nome_local, latitude, longitude, nome_imagem, media_avaliacao } = row;
            const location = acc.find(local => local.id === id);
            
            if (location) {
                if (nome_imagem) {
                    location.imagens.push(nome_imagem); // Adiciona a imagem se já existir o produto
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

        // // Ordena as imagens de cada produto de acordo com a ordem definida
         locais.forEach(location => {
             location.imagens.sort((a, b) => {
                 const ordemA = results.find(row => row.nome_imagem === a).ordem_img;
                 const ordemB = results.find(row => row.nome_imagem === b).ordem_img;
                 return ordemA - ordemB;
             });
         });
        

        res.json(locais);
    } catch (error) {
        console.error("Erro ao buscar locais do banco de dados:", error);
        res.status(500).send("Erro ao buscar locais");
    }
};


const getLocalFromId = async (req, res) => {
    const localId = req.query.id;

    try {
        const query = `
            SELECT l.id, l.nome_local, l.latitude, l.longitude, l.descricao, 
                   i.nome_imagem, a.comentario_local, a.avaliacao_estrela_locais,
                   u.nome AS nome_cliente, u.sobrenome AS sobrenome_cliente,
                   AVG(a.avaliacao_estrela_locais) AS media_avaliacao  -- Calcula a média das avaliações
            FROM locais l
            LEFT JOIN imagens i ON l.id = i.fk_local_id 
            LEFT JOIN avaliacao_local a ON l.id = a.fk_id_local 
            LEFT JOIN usuario_clientes u ON a.fk_id_cliente = u.id  
            WHERE l.id = ?
            GROUP BY l.id, i.nome_imagem, a.comentario_local, u.nome, u.sobrenome -- Agrupa os resultados para evitar duplicação
        `;

        const [results] = await connection.query(query, [localId]);


        // Formata os resultados para agrupar imagens e comentários por local
        const formattedResults = results.reduce((acc, row) => {
            const { nome_local, latitude, longitude, nome_imagem, comentario_local, avaliacao_estrela_locais, nome_cliente, sobrenome_cliente, media_avaliacao } = row;
            const local = acc.find(loc => loc.nome_local === nome_local);
            
            if (local) {
                // Adiciona as imagens, sem duplicar
                if (nome_imagem && !local.imagens.includes(nome_imagem)) {
                    local.imagens.push(nome_imagem);
                }
                
                // Adiciona os comentários, sem duplicar
                const comentarioExistente = local.comentarios.find(com => 
                    com.comentario_local === comentario_local &&
                    com.cliente === `${nome_cliente} ${sobrenome_cliente}`
                );
                
                if (!comentarioExistente) {
                    local.comentarios.push({
                        comentario_local,
                        avaliacao_estrela_locais,
                        cliente: `${nome_cliente} ${sobrenome_cliente}`
                    });
                }
            } else {
                acc.push({
                    nome_local,
                    latitude,
                    longitude,
                    media_avaliacao, // Inclui a média de avaliação
                    imagens: nome_imagem ? [nome_imagem] : [],
                    comentarios: comentario_local ? [{
                        comentario_local,
                        avaliacao_estrela_locais,
                        cliente: `${nome_cliente} ${sobrenome_cliente}`
                    }] : []
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

const favoritarLocal = async (req, res) => {
    const email = req.session.email;
    const localId = req.params.id; 

    // Log para verificar se o email e o prodId estão corretos
    console.error("Email:", email, "Local ID:", localId);

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

        const [location] = await connection.query(
            `SELECT id FROM locais WHERE id = ?`,
            [localId]
        );

        if (location.length === 0) {
            // 3. Verifica se o local do google já foi favoritado por esse usuário
            const [existingFavorite] = await connection.query(
                `SELECT * FROM favorito_locais WHERE fk_id_cliente = ? AND fk_id_google = ?`,
                [fk_id_cliente, localId]
            );

            // Se o produto já foi favoritado, desfavorita-o
            if (existingFavorite.length > 0) {
                console.log("Produto já foi favoritado, desfavoritando...");
                
                // Remove o produto da lista de favoritos
                await connection.query(
                    `DELETE FROM favorito_locais WHERE fk_id_cliente = ? AND fk_id_google = ?`,
                    [fk_id_cliente, localId]
                );
                
                return res.status(200).json({ message: 'Produto desfavoritado com sucesso.' });
            }

            // 4. Insere o novo produto favoritado
            const [addL] = await connection.query(
                `INSERT INTO favorito_locais (fk_id_cliente, fk_id_google) VALUES (?, ?)` ,
                [fk_id_cliente, localId]
            );
            console.log("Produto favoritado com sucesso!");
            return res.status(200).json({ message: 'Produto favoritado com sucesso!' });
        }

        // 3. Verifica se o produto já foi favoritado por esse usuário
        const [existingFavorite] = await connection.query(
            `SELECT * FROM favorito_locais WHERE fk_id_cliente = ? AND fk_id_local = ?`,
            [fk_id_cliente, localId]
        );


        
        // Se o produto já foi favoritado, desfavorita-o
        if (existingFavorite.length > 0) {
            console.log("Produto já foi favoritado, desfavoritando...");
            
            // Remove o produto da lista de favoritos
            await connection.query(
                `DELETE FROM favorito_locais WHERE fk_id_cliente = ? AND fk_id_local = ?`,
                [fk_id_cliente, localId]
            );
            
            return res.status(200).json({ message: 'Produto desfavoritado com sucesso.' });
        }

        // 4. Insere o novo produto favoritado
        const [addL] = await connection.query(
            `INSERT INTO favorito_locais (fk_id_cliente, fk_id_local) VALUES (?, ?)` ,
            [fk_id_cliente, localId]
        );

        console.log("Produto favoritado com sucesso!");
        return res.status(200).json({ message: 'Produto favoritado com sucesso!' });

    } catch (error) {
        console.error("Erro ao favoritar produto:", error);
        return res.status(500).json({ message: 'Erro ao favoritar produtos: ' + error.message });
    }
};

const checkCurtirLocal = async (req, res) => {
    const email = req.session.email;
    const localId = req.params.id;

    // Log para verificar se o email e o localId estão corretos
    console.error("Email:", email, "Local ID:", localId);

    try {
        // 1. Busca o ID do cliente (usuário) baseado no email
        const [user] = await connection.query(
            "SELECT id FROM usuario_clientes WHERE email = ?",
            [email]
        );

        // Verifica se o usuário foi encontrado
        if (user.length === 0) {
            return res.json({ favoritado: false }); // Retorna false se não encontrar o usuário
        }

        const fk_id_cliente = user[0].id;
        console.log("ID do Cliente:", fk_id_cliente);

        // Verifica se o local é do banco
        const [location] = await connection.query(
            "SELECT id FROM locais WHERE id = ?",
            [localId]
        );

        // Se o local não existe, verifica se já foi favoritado
        if (location.length === 0) {
            const [existingFavorite] = await connection.query(
                "SELECT * FROM favorito_locais WHERE fk_id_cliente = ? AND fk_id_google = ?",
                [fk_id_cliente, localId]
            );

            // Se o local estiver favoritado, retornar TRUE
            if (existingFavorite.length > 0) {
                return res.json({ favoritado: true });
            }
            // Senão retornar FALSE
            return res.json({ favoritado: false });
        }

        // Verifica se o local já foi favoritado por esse usuário
        const [existingFavorite] = await connection.query(
            "SELECT * FROM favorito_locais WHERE fk_id_cliente = ? AND fk_id_local = ?",
            [fk_id_cliente, localId]
        );

        // Se o local estiver favoritado, retornar TRUE
        if (existingFavorite.length > 0) {
            return res.json({ favoritado: true });
        }

        // Senão retornar FALSE
        return res.json({ favoritado: false });

    } catch (error) {
        console.error("Erro ao favoritar produto:", error);
        return res.status(500).json({ error: 'Erro interno' });
    }
};


module.exports ={ 
    adicionarLocais, locaisBanco, getLocalFromId, avaliarLocais, avaliarLocaisBanco, favoritarLocal, checkCurtirLocal, pegarLocaisCurtido,
}
