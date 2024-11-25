var connection = require("../../config/pool_conexoes");
const express = require('express');

const adicionarLocaisPremium = async (req, res) => {
    const { nome_local, local_category, preco_hora, desc_local, latitude, longitude, horarios, totalEspaco } = req.body;
    const email = req.session.email;

    const parsedHorarios = JSON.parse(horarios);

    console.log("Horários recebidos (como objeto):", parsedHorarios);
    

    console.log(totalEspaco)
    console.log(nome_local)
    console.log(local_category)
    console.log(preco_hora)
    console.log(desc_local)
    console.log(latitude)
    console.log(longitude)
    // console.log("Horários recebidos:", horarios);

      




    

    try {
         // Obtém o ID da empresa
        const [user] = await connection.query(
            `SELECT id FROM empresas WHERE email = ?`,
            [email]
        );

        if (user.length === 0) {
            req.flash('error_msg', 'Empresa não encontrada');
            return res.redirect('/locais-esportivos');
        }

        const fk_id_emp = user[0].id; // Atribuindo fk_id_emp
        

        // Verifica se o local já existe
        const [endExist] = await connection.query(
            "SELECT * FROM locais WHERE latitude = ? AND longitude = ?",
            [latitude, longitude]
        );

        if (endExist.length > 0) {
            req.flash('error_msg', 'Esse endereço já foi adicionado ao Sports Map.');
            return res.redirect('/locais-esportivos');
        }

        if(totalEspaco == 1){
            // Insere o novo local
            console.log("deu grenn")

            const [addL] = await connection.query(
                `INSERT INTO local_premium (fk_id_empresa, nome_local_premium, categoria, latitude, longitude, descricao) VALUES (?, ?, ?, ?, ?, ?)`,
                [fk_id_emp, nome_local, local_category, latitude, longitude, desc_local]
            );

            const locaisId = addL.insertId;

            const [addespaco] = await connection.query(
                `INSERT INTO espaco_local (fk_id_local_premium, nome_espaco, preco_hora) VALUES (?, ?, ?)`,
                [locaisId, nome_local, preco_hora]
            );


        } else if (totalEspaco == 2){

            const { nome_local2, preco_hora2, categoriaConfirm2, local_category2} = req.body;
            console.log(nome_local2)
            console.log(preco_hora2)

            if(categoriaConfirm2 == 2){
                console.log("sim categoria 2")
                const [addL] = await connection.query(
                    `INSERT INTO local_premium (fk_id_empresa, nome_local_premium, categoria, categoria_2, latitude, longitude, descricao) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [fk_id_emp, nome_local, local_category, local_category2, latitude, longitude, desc_local]
                );
            } else {
                console.log("não categoria 2")
                const [addL] = await connection.query(
                    `INSERT INTO local_premium (fk_id_empresa, nome_local_premium, categoria, latitude, longitude, descricao) VALUES (?, ?, ?, ?, ?, ?)`,
                    [fk_id_emp, nome_local, local_category, latitude, longitude, desc_local]
                );
            }

    
            const locaisId = addL.insertId;
    
            const [addespaco] = await connection.query(
                `INSERT INTO espaco_local (fk_id_local_premium, nome_espaco, preco_hora) VALUES (?, ?, ?)`,
                [locaisId, nome_local, preco_hora]
            );

            const [addespaco2] = await connection.query(
                `INSERT INTO espaco_local (fk_id_local_premium, nome_espaco, preco_hora) VALUES (?, ?, ?)`,
                [locaisId, nome_local2, preco_hora2]
            );

        } else if (totalEspaco == 3) {
            // não feito ainda
            const { nome_local2, preco_hora2, categoriaConfirm2, local_category2, nome_local3, preco_hora3, categoriaConfirm3,} = req.body;
            console.log(nome_local2)
            console.log(preco_hora2)

            if(categoriaConfirm2 == 2){
                console.log("sim categoria 2")
                const [addL] = await connection.query(
                    `INSERT INTO local_premium (fk_id_empresa, nome_local_premium, categoria, categoria_2, latitude, longitude, descricao) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [fk_id_emp, nome_local, local_category, local_category2, latitude, longitude, desc_local]
                );
            } else {
                console.log("não categoria 2")
                const [addL] = await connection.query(
                    `INSERT INTO local_premium (fk_id_empresa, nome_local_premium, categoria, latitude, longitude, descricao) VALUES (?, ?, ?, ?, ?, ?)`,
                    [fk_id_emp, nome_local, local_category, latitude, longitude, desc_local]
                );
            }

    
            const locaisId = addL.insertId;
    
            const [addespaco] = await connection.query(
                `INSERT INTO espaco_local (fk_id_local_premium, nome_espaco, preco_hora) VALUES (?, ?, ?)`,
                [locaisId, nome_local, preco_hora]
            );

            const [addespaco2] = await connection.query(
                `INSERT INTO espaco_local (fk_id_local_premium, nome_espaco, preco_hora) VALUES (?, ?, ?)`,
                [locaisId, nome_local2, preco_hora2]
            );
            
            const [addespaco3] = await connection.query(
                `INSERT INTO espaco_local (fk_id_local_premium, nome_espaco, preco_hora) VALUES (?, ?, ?)`,
                [locaisId, nome_local3, preco_hora3]
            );
        }

        


        // Adicionar dia de atuação
        for (let chave in parsedHorarios) {
            const [addAtua] = await connection.query(
                `INSERT INTO dia_atuacao (fk_id_local_premium, dia_semana, horario_inicio, horario_fim) VALUES (?, ?, ?, ?)`,
                [locaisId, chave, parsedHorarios[chave].inicio, parsedHorarios[chave].fim]
            );
        }
        
        

        // Armazena as imagens no banco de dados
        if (req.files && req.files.length > 0) {
            const imagens = req.files.map(file => file.filename);
            for (let imagem of imagens) {
                await connection.query(
                    `INSERT INTO imagens (fk_local_premium_id, nome_imagem) VALUES (?, ?)`,
                    [locaisId, imagem]
                );
            }
        }

        req.flash('success_msg', 'Local adicionado com sucesso!');

        // Redireciona após sucesso
        res.redirect('/locais-esportivos');

    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar Local: ' + error.message);
        console.log(error);
        res.redirect('/locais-esportivos');
    }
};

const locaisBancoPremium = async (req, res) => {
    const { categoria } = req.query; // Pega a categoria da query string

    try {
        const query = `
            SELECT l.id_local_premium, l.nome_local_premium, l.latitude, l.longitude, i.nome_imagem, AVG(a.avaliacao_estrela_locais) AS media_avaliacao
            FROM local_premium l 
            LEFT JOIN imagens i ON l.id_local_premium = i.fk_local_premium_id
            LEFT JOIN avaliacao_local a ON l.id_local_premium = a.fk_id_local_premium  
            WHERE l.categoria = ?
            GROUP BY l.id_local_premium, i.nome_imagem
        `;
        const [results] = await connection.query(query, [categoria]); // Filtra pela categoria

        // Formata os resultados para agrupar imagens por local
        const formattedResults = results.reduce((acc, row) => {
            const { id_local_premium, nome_local_premium, latitude, longitude, nome_imagem, media_avaliacao } = row;
            const local = acc.find(loc => loc.id_local_premium === id_local_premium); // Procura pelo ID único
            if (local) {
                if (nome_imagem) {
                    local.imagens.push(nome_imagem);
                }
            } else {
                acc.push({
                    id_local_premium,
                    nome_local_premium,
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

const getLocalPremiumFromId = async (req, res) => {
    const localId = req.query.id;

    try {
        const query = `
            SELECT l.id_local_premium, l.nome_local_premium, l.latitude, l.longitude, l.descricao, 
                   i.nome_imagem, a.comentario_local, a.avaliacao_estrela_locais,
                   u.nome AS nome_cliente, u.sobrenome AS sobrenome_cliente,
                   AVG(a.avaliacao_estrela_locais) AS media_avaliacao  -- Calcula a média das avaliações
            FROM local_premium l
            LEFT JOIN imagens i ON l.id_local_premium = i.fk_local_premium_id
            LEFT JOIN avaliacao_local a ON l.id_local_premium = a.fk_id_local_premium 
            LEFT JOIN usuario_clientes u ON a.fk_id_cliente = u.id  
            WHERE l.id_local_premium = ?
            GROUP BY l.id_local_premium, i.nome_imagem, a.comentario_local, u.nome, u.sobrenome -- Agrupa os resultados para evitar duplicação
        `;

        const [results] = await connection.query(query, [localId]);


        // Formata os resultados para agrupar imagens e comentários por local
        const formattedResults = results.reduce((acc, row) => {
            const { nome_local_premium, latitude, longitude, nome_imagem, comentario_local, avaliacao_estrela_locais, nome_cliente, sobrenome_cliente, media_avaliacao } = row;
            const local = acc.find(loc => loc.nome_local_premium === nome_local_premium);
            
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
                    nome_local_premium,
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
    adicionarLocaisPremium, locaisBancoPremium, getLocalPremiumFromId,
}