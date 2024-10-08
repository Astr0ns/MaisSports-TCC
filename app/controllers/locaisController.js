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
    const { nome_local, categoria, descricao, latitude, longitude } = req.body;

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
        res.redirect('/locais-esportivos');

    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar Local: ' + error.message);
        console.log(error);
        res.redirect('/locais-esportivos');
    }
};

const avaliarLocais = async (req, res) => {}

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





module.exports ={ 
    adicionarLocais, locaisBanco, getLocalFromId,
}
