var connection = require("../../config/pool_conexoes");
const express = require('express');

exports.verificarDisponibilidade = async (req, res) => {
    const { id_local, data_reserva } = req.body;

    try {
        // Conversão do dia da semana para português
        const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        const diaSemana = diasSemana[new Date(data_reserva).getDay()];

        // Busca os dias de atuação do local
        const [diasAtuacao] = await pool.query(`
            SELECT * 
            FROM dia_atuacao 
            WHERE fk_id_local_premium = ? AND dia_semana = ?
        `, [id_local, diaSemana]);

        if (diasAtuacao.length === 0) {
            return res.status(404).json({ message: 'Local não atua nesse dia.' });
        }

        // Busca as reservas já feitas para o local e o dia desejado
        const [reservas] = await pool.query(`
            SELECT * 
            FROM Reserva 
            WHERE fk_id_local_premium = ? AND data_reserva = ?
        `, [id_local, data_reserva]);

        // Verifica os horários disponíveis comparando com as reservas existentes
        const horariosDisponiveis = diasAtuacao.filter(dia => {
            return !reservas.some(reserva =>
                (reserva.horario_inicio >= dia.horario_inicio && reserva.horario_inicio < dia.horario_fim) ||
                (reserva.horario_fim > dia.horario_inicio && reserva.horario_fim <= dia.horario_fim)
            );
        });

        if (horariosDisponiveis.length === 0) {
            return res.status(400).json({ message: 'Não há horários disponíveis para esta data.' });
        }

        return res.json(horariosDisponiveis);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao verificar disponibilidade.', error });
    }
};

// Faz uma nova reserva
exports.criarReserva = async (req, res) => {
    const { id_usuario, id_local, data_reserva, horario_inicio, horario_fim } = req.body;

    try {
        // Verifica se o local está disponível no horário desejado
        const [reservasExistentes] = await pool.query(`
            SELECT * 
            FROM Reserva 
            WHERE fk_id_local_premium = ? AND data_reserva = ? 
            AND (horario_inicio BETWEEN ? AND ? OR horario_fim BETWEEN ? AND ?)
        `, [id_local, data_reserva, horario_inicio, horario_fim, horario_inicio, horario_fim]);

        if (reservasExistentes.length > 0) {
            return res.status(400).json({ message: 'Horário indisponível.' });
        }

        // Buscar o preço por hora do local
        const [local] = await pool.query(`
            SELECT preco_hora 
            FROM local_premium 
            WHERE id_local_premium  = ?
        `, [id_local]);

        if (local.length === 0) {
            return res.status(404).json({ message: 'Local não encontrado.' });
        }

        const precoHora = local[0].preco_hora;

        // Calcular o preço total com base nas horas reservadas
        const horasReservadas = (new Date(`1970-01-01T${horario_fim}Z`) - new Date(`1970-01-01T${horario_inicio}Z`)) / 1000 / 60 / 60;
        const precoTotal = horasReservadas * precoHora;

        // Inserir a nova reserva
        const [resultado] = await pool.query(`
            INSERT INTO Reserva (fk_id_cliente, fk_id_local_premium , data_reserva, horario_inicio, horario_fim, preco_total)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id_usuario, id_local, data_reserva, horario_inicio, horario_fim, precoTotal]);

        return res.json({ id_reserva: resultado.insertId, preco_total: precoTotal });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar reserva.', error });
    }
};

exports.getLocalReservaById = (path) => {
    return async (req, res) => {
        const localId = req.params.id;
        const email = req.session.email; // Pega o email da sessão, se estiver definido
        try {
            const query = `
                SELECT l.id_local_premium, l.nome_local_premium, l.latitude, l.longitude, l.descricao, l.preco_hora,
                    d.dia_semana, d.horario_inicio, d.horario_fim,
                    i.nome_imagem, a.comentario_local, a.avaliacao_estrela_locais,
                    u.nome AS nome_cliente, u.sobrenome AS sobrenome_cliente,
                    AVG(a.avaliacao_estrela_locais) AS media_avaliacao  -- Calcula a média das avaliações
                FROM local_premium l
                LEFT JOIN imagens i ON l.id_local_premium = i.fk_local_premium_id
                LEFT JOIN avaliacao_local a ON l.id_local_premium = a.fk_id_local_premium 
                LEFT JOIN usuario_clientes u ON a.fk_id_cliente = u.id 
                LEFT JOIN dia_atuacao d on l.id_local_premium = d.fk_id_local_premium 
                WHERE l.id_local_premium = ?
                GROUP BY l.id_local_premium, i.nome_imagem, d.dia_semana, a.comentario_local, u.nome, u.sobrenome -- Agrupa os resultados para evitar duplicação
            `;
            const [results] = await connection.query(query, [localId]);

            const formattedResults = results.reduce((acc, row) => {
                const { nome_local_premium, latitude, longitude, preco_hora, dia_semana, horario_inicio, horario_fim, nome_imagem, comentario_local, avaliacao_estrela_locais, nome_cliente, sobrenome_cliente, media_avaliacao } = row;
                const local = acc.find(loc => loc.nome_local_premium === nome_local_premium);
                
                if (local) {
                    // Adiciona as imagens, sem duplicar
                    if (nome_imagem && !local.imagens.includes(nome_imagem)) {
                        local.imagens.push(nome_imagem);
                    }

                    if (dia_semana) {
                        local.dias.push({
                            dia_semana,
                            horario_inicio,
                            horario_fim
                        });
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
                        preco_hora,
                        media_avaliacao, // Inclui a média de avaliação
                        imagens: nome_imagem ? [nome_imagem] : [],
                        dias: dia_semana ? [{
                            dia_semana,
                            horario_inicio,
                            horario_fim
                        }] : [],
                        comentarios: comentario_local ? [{
                            comentario_local,
                            avaliacao_estrela_locais,
                            cliente: `${nome_cliente} ${sobrenome_cliente}`
                        }] : []
                    });
                }
    
                return acc;
            }, []);

            if (formattedResults.length > 0) {
                
                // res.json(formattedResults);
                res.render(path, { local: formattedResults[0], email: email }) ; // Usa o caminho passado
            } else {
                res.status(404).send("Produto não encontrado");
            }
    
            
        } catch (error) {
            console.error("Erro ao buscar o produto no banco de dados:", error);
            res.status(500).send("Erro ao buscar o produto");
        }
    };
};