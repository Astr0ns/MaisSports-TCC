const connection = require("../../config/pool_conexoes");

const adicionarLocais = async (req, res) => {
    const { nome_local, local_category, desc_local, latitude, longitude } = req.body;

    try {
        const endExist = await connection.query(
            "SELECT * FROM locais WHERE latitude = $1 AND longitude = $2",
            [latitude, longitude]
        );

        if (endExist.rows.length > 0) {
            req.flash('error_msg', 'Esse endereço já foi adicionado ao Sports Map.');
            return res.redirect('/locais-esportivos');
        }

        const addL = await connection.query(
            "INSERT INTO locais (nome_local, categoria, descricao, latitude, longitude) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [nome_local, local_category, desc_local, latitude, longitude]
        );

        const locaisId = addL.rows[0].id;

        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                await connection.query(
                    "INSERT INTO imagens (fk_local_id, nome_imagem) VALUES ($1, $2)",
                    [locaisId, file.filename]
                );
            }
        }

        req.flash('success_msg', 'Local adicionado com sucesso!');
        res.redirect('/locais-esportivos');

    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar Local: ' + error.message);
        console.log(error);
        res.redirect('/locais-esportivos');
    }
};

const avaliarLocais = async (req, res) => {
    const { placeId_google, rating, comentario, email } = req.body;

    try {
        const user = await connection.query(
            "SELECT id FROM usuario_clientes WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            req.flash('error_msg', 'Usuário não encontrado.');
            return res.redirect('/add-locais');
        }

        const fk_id_cliente = user.rows[0].id;

        await connection.query(
            "INSERT INTO avaliacao_googleplaces (fk_id_cliente, fk_id_google, comentario_local, avaliacao_estrela_locais) VALUES ($1, $2, $3, $4)",
            [fk_id_cliente, placeId_google, comentario, rating]
        );

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

    try {
        const user = await connection.query(
            "SELECT id FROM usuario_clientes WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            req.flash('error_msg', 'Usuário não encontrado.');
            return res.redirect('/add-locais');
        }

        const fk_id_cliente = user.rows[0].id;

        await connection.query(
            "INSERT INTO avaliacao_local (fk_id_cliente, fk_id_local, comentario_local, avaliacao_estrela_locais) VALUES ($1, $2, $3, $4)",
            [fk_id_cliente, localId, comentario, rating]
        );

        req.flash('success_msg', 'Avaliação adicionada com sucesso');
        res.redirect('/locais-esportivos');

    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar avaliação: ' + error.message);
        res.redirect('/locais-esportivos');
    }
};

const locaisBanco = async (req, res) => {
    const { categoria } = req.query;

    try {
        const query = `
            SELECT l.id, l.nome_local, l.latitude, l.longitude, i.nome_imagem, 
                   AVG(a.avaliacao_estrela_locais) AS media_avaliacao
            FROM locais l 
            LEFT JOIN imagens i ON l.id = i.fk_local_id
            LEFT JOIN avaliacao_local a ON l.id = a.fk_id_local  
            WHERE l.categoria = $1
            GROUP BY l.id, i.nome_imagem
        `;
        const result = await connection.query(query, [categoria]);

        const formattedResults = result.rows.reduce((acc, row) => {
            const { id, nome_local, latitude, longitude, nome_imagem, media_avaliacao } = row;
            const local = acc.find(loc => loc.id === id);
            if (local) {
                if (nome_imagem) local.imagens.push(nome_imagem);
            } else {
                acc.push({ id, nome_local, latitude, longitude, imagens: nome_imagem ? [nome_imagem] : [], media_avaliacao });
            }
            return acc;
        }, []);

        res.json(formattedResults);
    } catch (error) {
        console.error("Erro ao buscar locais:", error);
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
                   AVG(a.avaliacao_estrela_locais) OVER (PARTITION BY l.id) AS media_avaliacao
            FROM locais l
            LEFT JOIN imagens i ON l.id = i.fk_local_id 
            LEFT JOIN avaliacao_local a ON l.id = a.fk_id_local 
            LEFT JOIN usuario_clientes u ON a.fk_id_cliente = u.id  
            WHERE l.id = $1
        `;
        const result = await connection.query(query, [localId]);

        const formattedResults = result.rows.reduce((acc, row) => {
            const { nome_local, latitude, longitude, nome_imagem, comentario_local, avaliacao_estrela_locais, nome_cliente, sobrenome_cliente, media_avaliacao } = row;
            const local = acc.find(loc => loc.nome_local === nome_local);

            if (local) {
                if (nome_imagem && !local.imagens.includes(nome_imagem)) local.imagens.push(nome_imagem);
                const existe = local.comentarios.find(c => c.comentario_local === comentario_local && c.cliente === `${nome_cliente} ${sobrenome_cliente}`);
                if (!existe && comentario_local) local.comentarios.push({ comentario_local, avaliacao_estrela_locais, cliente: `${nome_cliente} ${sobrenome_cliente}` });
            } else {
                acc.push({
                    nome_local, latitude, longitude, media_avaliacao,
                    imagens: nome_imagem ? [nome_imagem] : [],
                    comentarios: comentario_local ? [{ comentario_local, avaliacao_estrela_locais, cliente: `${nome_cliente} ${sobrenome_cliente}` }] : []
                });
            }
            return acc;
        }, []);

        res.json(formattedResults);
    } catch (error) {
        console.error("Erro ao buscar local:", error);
        res.status(500).send("Erro ao buscar local");
    }
};

const favoritarLocal = async (req, res) => {
    const email = req.session.email;
    const localId = req.params.id;

    try {
        const user = await connection.query("SELECT id FROM usuario_clientes WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const fk_id_cliente = user.rows[0].id;

        const location = await connection.query("SELECT id FROM locais WHERE id = $1", [localId]);

        if (location.rows.length === 0) {
            const existingFav = await connection.query(
                "SELECT * FROM favorito_locais WHERE fk_id_cliente = $1 AND fk_id_google = $2",
                [fk_id_cliente, localId]
            );
            if (existingFav.rows.length > 0) {
                await connection.query("DELETE FROM favorito_locais WHERE fk_id_cliente = $1 AND fk_id_google = $2", [fk_id_cliente, localId]);
                return res.status(200).json({ message: 'Local desfavoritado.' });
            }
            await connection.query("INSERT INTO favorito_locais (fk_id_cliente, fk_id_google) VALUES ($1, $2)", [fk_id_cliente, localId]);
            return res.status(200).json({ message: 'Local favoritado!' });
        }

        const existingFav = await connection.query(
            "SELECT * FROM favorito_locais WHERE fk_id_cliente = $1 AND fk_id_local = $2",
            [fk_id_cliente, localId]
        );
        if (existingFav.rows.length > 0) {
            await connection.query("DELETE FROM favorito_locais WHERE fk_id_cliente = $1 AND fk_id_local = $2", [fk_id_cliente, localId]);
            return res.status(200).json({ message: 'Local desfavoritado.' });
        }
        await connection.query("INSERT INTO favorito_locais (fk_id_cliente, fk_id_local) VALUES ($1, $2)", [fk_id_cliente, localId]);
        return res.status(200).json({ message: 'Local favoritado!' });

    } catch (error) {
        console.error("Erro ao favoritar local:", error);
        return res.status(500).json({ message: 'Erro: ' + error.message });
    }
};

const checkCurtirLocal = async (req, res) => {
    const email = req.session.email;
    const localId = req.params.id;

    try {
        const user = await connection.query("SELECT id FROM usuario_clientes WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.json({ favoritado: false });

        const fk_id_cliente = user.rows[0].id;

        const location = await connection.query("SELECT id FROM locais WHERE id = $1", [localId]);

        if (location.rows.length === 0) {
            const fav = await connection.query(
                "SELECT * FROM favorito_locais WHERE fk_id_cliente = $1 AND fk_id_google = $2",
                [fk_id_cliente, localId]
            );
            return res.json({ favoritado: fav.rows.length > 0 });
        }

        const fav = await connection.query(
            "SELECT * FROM favorito_locais WHERE fk_id_cliente = $1 AND fk_id_local = $2",
            [fk_id_cliente, localId]
        );
        return res.json({ favoritado: fav.rows.length > 0 });

    } catch (error) {
        console.error("Erro:", error);
        return res.status(500).json({ error: 'Erro interno' });
    }
};

module.exports = {
    adicionarLocais, locaisBanco, getLocalFromId, avaliarLocais,
    avaliarLocaisBanco, favoritarLocal, checkCurtirLocal
};
