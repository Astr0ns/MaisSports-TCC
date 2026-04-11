const connection = require("../../config/pool_conexoes");

const adicionarLocaisPremium = async (req, res) => {
    const { nome_local, local_category, preco_hora, desc_local, latitude, longitude, horarios, totalEspaco } = req.body;
    const email = req.session.email;
    const parsedHorarios = JSON.parse(horarios);

    try {
        const userResult = await connection.query(
            "SELECT id FROM empresas WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            req.flash('error_msg', 'Empresa não encontrada');
            return res.redirect('/locais-esportivos');
        }

        const fk_id_emp = userResult.rows[0].id;

        const endExist = await connection.query(
            "SELECT * FROM locais WHERE latitude = $1 AND longitude = $2",
            [latitude, longitude]
        );

        if (endExist.rows.length > 0) {
            req.flash('error_msg', 'Esse endereço já foi adicionado ao Sports Map.');
            return res.redirect('/locais-esportivos');
        }

        let locaisId;

        if (totalEspaco == 1) {
            const addL = await connection.query(
                "INSERT INTO local_premium (fk_id_empresa, nome_local_premium, categoria, latitude, longitude, descricao) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_local_premium",
                [fk_id_emp, nome_local, local_category, latitude, longitude, desc_local]
            );
            locaisId = addL.rows[0].id_local_premium;

            await connection.query(
                "INSERT INTO espaco_local (fk_id_local_premium, nome_espaco, preco_hora) VALUES ($1, $2, $3)",
                [locaisId, nome_local, preco_hora]
            );

        } else if (totalEspaco == 2) {
            const { nome_local2, preco_hora2, categoriaConfirm2, local_category2 } = req.body;

            let addL;
            if (categoriaConfirm2 == 2) {
                addL = await connection.query(
                    "INSERT INTO local_premium (fk_id_empresa, nome_local_premium, categoria, categoria_2, latitude, longitude, descricao) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_local_premium",
                    [fk_id_emp, nome_local, local_category, local_category2, latitude, longitude, desc_local]
                );
            } else {
                addL = await connection.query(
                    "INSERT INTO local_premium (fk_id_empresa, nome_local_premium, categoria, latitude, longitude, descricao) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_local_premium",
                    [fk_id_emp, nome_local, local_category, latitude, longitude, desc_local]
                );
            }
            locaisId = addL.rows[0].id_local_premium;

            await connection.query(
                "INSERT INTO espaco_local (fk_id_local_premium, nome_espaco, preco_hora) VALUES ($1, $2, $3)",
                [locaisId, nome_local, preco_hora]
            );
            await connection.query(
                "INSERT INTO espaco_local (fk_id_local_premium, nome_espaco, preco_hora) VALUES ($1, $2, $3)",
                [locaisId, nome_local2, preco_hora2]
            );

        } else if (totalEspaco == 3) {
            const { nome_local2, preco_hora2, categoriaConfirm2, local_category2, nome_local3, preco_hora3 } = req.body;

            let addL;
            if (categoriaConfirm2 == 2) {
                addL = await connection.query(
                    "INSERT INTO local_premium (fk_id_empresa, nome_local_premium, categoria, categoria_2, latitude, longitude, descricao) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_local_premium",
                    [fk_id_emp, nome_local, local_category, local_category2, latitude, longitude, desc_local]
                );
            } else {
                addL = await connection.query(
                    "INSERT INTO local_premium (fk_id_empresa, nome_local_premium, categoria, latitude, longitude, descricao) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_local_premium",
                    [fk_id_emp, nome_local, local_category, latitude, longitude, desc_local]
                );
            }
            locaisId = addL.rows[0].id_local_premium;

            await connection.query("INSERT INTO espaco_local (fk_id_local_premium, nome_espaco, preco_hora) VALUES ($1, $2, $3)", [locaisId, nome_local, preco_hora]);
            await connection.query("INSERT INTO espaco_local (fk_id_local_premium, nome_espaco, preco_hora) VALUES ($1, $2, $3)", [locaisId, nome_local2, preco_hora2]);
            await connection.query("INSERT INTO espaco_local (fk_id_local_premium, nome_espaco, preco_hora) VALUES ($1, $2, $3)", [locaisId, nome_local3, preco_hora3]);
        }

        // Adicionar dias de atuação
        for (let chave in parsedHorarios) {
            await connection.query(
                "INSERT INTO dia_atuacao (fk_id_local_premium, dia_semana, horario_inicio, horario_fim) VALUES ($1, $2, $3, $4)",
                [locaisId, chave, parsedHorarios[chave].inicio, parsedHorarios[chave].fim]
            );
        }

        // Armazena as imagens
        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                await connection.query(
                    "INSERT INTO imagens (fk_local_premium_id, nome_imagem) VALUES ($1, $2)",
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

const locaisBancoPremium = async (req, res) => {
    const { categoria } = req.query;

    try {
        const query = `
            SELECT l.id_local_premium, l.nome_local_premium, l.latitude, l.longitude, 
                   i.nome_imagem, AVG(a.avaliacao_estrela_locais) AS media_avaliacao
            FROM local_premium l 
            LEFT JOIN imagens i ON l.id_local_premium = i.fk_local_premium_id
            LEFT JOIN avaliacao_local a ON l.id_local_premium = a.fk_id_local_premium  
            WHERE l.categoria = $1
            GROUP BY l.id_local_premium, i.nome_imagem
        `;
        const result = await connection.query(query, [categoria]);

        const formattedResults = result.rows.reduce((acc, row) => {
            const { id_local_premium, nome_local_premium, latitude, longitude, nome_imagem, media_avaliacao } = row;
            const local = acc.find(loc => loc.id_local_premium === id_local_premium);
            if (local) {
                if (nome_imagem) local.imagens.push(nome_imagem);
            } else {
                acc.push({ id_local_premium, nome_local_premium, latitude, longitude, imagens: nome_imagem ? [nome_imagem] : [], media_avaliacao });
            }
            return acc;
        }, []);

        res.json(formattedResults);
    } catch (error) {
        console.error("Erro ao buscar locais:", error);
        res.status(500).send("Erro ao buscar locais");
    }
};

const getLocalPremiumFromId = async (req, res) => {
    const localId = req.query.id;

    try {
        const query = `
            SELECT l.id_local_premium, l.nome_local_premium, l.latitude, l.longitude, l.descricao, 
                   i.nome_imagem, a.comentario_local, a.avaliacao_estrela_locais,
                   u.nome AS nome_cliente, u.sobrenome AS sobrenome_cliente,
                   AVG(a.avaliacao_estrela_locais) OVER (PARTITION BY l.id_local_premium) AS media_avaliacao
            FROM local_premium l
            LEFT JOIN imagens i ON l.id_local_premium = i.fk_local_premium_id
            LEFT JOIN avaliacao_local a ON l.id_local_premium = a.fk_id_local_premium 
            LEFT JOIN usuario_clientes u ON a.fk_id_cliente = u.id  
            WHERE l.id_local_premium = $1
        `;
        const result = await connection.query(query, [localId]);

        const formattedResults = result.rows.reduce((acc, row) => {
            const { nome_local_premium, latitude, longitude, nome_imagem, comentario_local, avaliacao_estrela_locais, nome_cliente, sobrenome_cliente, media_avaliacao } = row;
            const local = acc.find(loc => loc.nome_local_premium === nome_local_premium);

            if (local) {
                if (nome_imagem && !local.imagens.includes(nome_imagem)) local.imagens.push(nome_imagem);
                const existe = local.comentarios.find(c => c.comentario_local === comentario_local && c.cliente === `${nome_cliente} ${sobrenome_cliente}`);
                if (!existe && comentario_local) local.comentarios.push({ comentario_local, avaliacao_estrela_locais, cliente: `${nome_cliente} ${sobrenome_cliente}` });
            } else {
                acc.push({
                    nome_local_premium, latitude, longitude, media_avaliacao,
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

module.exports = { adicionarLocaisPremium, locaisBancoPremium, getLocalPremiumFromId };
