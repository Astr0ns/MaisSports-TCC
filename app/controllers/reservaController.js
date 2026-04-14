const path = require('path');
var connection = require("../../config/pool_conexoes");
const multer = require('multer');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { all } = require('../routes/productRouter');

// Inicialize o cliente Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: 'TEST-5246075068010463-102011-23539c46def1acb4b061770a6d174e1e-428968371',
    options: { timeout: 5000, idempotencyKey: 'abc' }
});

const verificarDisponibilidade = async (req, res) => {
    const { id_local, data_reserva } = req.body;

    try {
        const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        const diaSemana = diasSemana[new Date(data_reserva).getDay()];

        const { rows: diasAtuacao } = await connection.query(`
            SELECT * 
            FROM dia_atuacao 
            WHERE fk_id_local_premium = $1 AND dia_semana = $2
        `, [id_local, diaSemana]);

        if (diasAtuacao.length === 0) {
            return res.status(404).json({ message: 'Local não atua nesse dia.' });
        }

        const { rows: reservas } = await connection.query(`
            SELECT * 
            FROM Reserva 
            WHERE fk_id_local_premium = $1 AND data_reserva = $2
        `, [id_local, data_reserva]);

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

const criarReserva = async (req, res) => {
    const { id_usuario, id_local, data_reserva, horario_inicio, horario_fim } = req.body;

    try {
        const { rows: reservasExistentes } = await connection.query(`
            SELECT * 
            FROM Reserva 
            WHERE fk_id_local_premium = $1 AND data_reserva = $2 
            AND (horario_inicio BETWEEN $3 AND $4 OR horario_fim BETWEEN $5 AND $6)
        `, [id_local, data_reserva, horario_inicio, horario_fim, horario_inicio, horario_fim]);

        if (reservasExistentes.length > 0) {
            return res.status(400).json({ message: 'Horário indisponível.' });
        }

        const { rows: localRows } = await connection.query(`
            SELECT preco_hora 
            FROM local_premium 
            WHERE id_local_premium = $1
        `, [id_local]);

        if (localRows.length === 0) {
            return res.status(404).json({ message: 'Local não encontrado.' });
        }

        const precoHora = localRows[0].preco_hora;

        const horasReservadas = (new Date(`1970-01-01T${horario_fim}Z`) - new Date(`1970-01-01T${horario_inicio}Z`)) / 1000 / 60 / 60;
        const precoTotal = horasReservadas * precoHora;

        const { rows: resultado } = await connection.query(`
            INSERT INTO Reserva (fk_id_cliente, fk_id_local_premium, data_reserva, horario_inicio, horario_fim, preco_total)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id_reserva
        `, [id_usuario, id_local, data_reserva, horario_inicio, horario_fim, precoTotal]);

        return res.json({ id_reserva: resultado[0].id_reserva, preco_total: precoTotal });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar reserva.', error });
    }
};

const getLocalReservaById = (path) => {
    return async (req, res) => {
        const localId = req.params.id;
        const email = req.session.email;
        try {
            const query = `
                SELECT l.id_local_premium, l.nome_local_premium, l.latitude, l.longitude, l.descricao,
                e.preco_hora, e.id_espaco_local, e.nome_espaco,
                    d.dia_semana, d.horario_inicio, d.horario_fim,
                    i.nome_imagem, a.comentario_local, a.avaliacao_estrela_locais,
                    u.nome AS nome_cliente, u.sobrenome AS sobrenome_cliente,
                    AVG(a.avaliacao_estrela_locais) AS media_avaliacao
                FROM local_premium l
                LEFT JOIN imagens i ON l.id_local_premium = i.fk_local_premium_id
                LEFT JOIN avaliacao_local a ON l.id_local_premium = a.fk_id_local_premium 
                LEFT JOIN usuario_clientes u ON a.fk_id_cliente = u.id 
                LEFT JOIN dia_atuacao d on l.id_local_premium = d.fk_id_local_premium 
                LEFT JOIN espaco_local e on l.id_local_premium = e.fk_id_local_premium
                WHERE l.id_local_premium = $1
                GROUP BY l.id_local_premium, i.nome_imagem, d.dia_semana, a.comentario_local, e.id_espaco_local, u.nome, u.sobrenome
            `;
            const { rows: results } = await connection.query(query, [localId]);

            const formattedResults = results.reduce((acc, row) => {
                const { id_local_premium, nome_local_premium, latitude, longitude, descricao,
                    preco_hora, id_espaco_local, nome_espaco,
                    dia_semana, horario_inicio, horario_fim, nome_imagem, comentario_local,
                    avaliacao_estrela_locais, nome_cliente, sobrenome_cliente, media_avaliacao } = row;

                const local = acc.find(loc => loc.nome_local_premium === nome_local_premium);

                if (local) {
                    if (nome_imagem && !local.imagens.includes(nome_imagem)) {
                        local.imagens.push(nome_imagem);
                    }

                    const dia_semanaExistente = local.dias.find(com =>
                        com.dia_semana === dia_semana &&
                        com.horario_inicio === horario_inicio &&
                        com.horario_fim === horario_fim
                    );
                    if (!dia_semanaExistente) {
                        local.dias.push({ dia_semana, horario_inicio, horario_fim });
                    }

                    const id_espaco_localExistente = local.precos.find(com =>
                        com.id_espaco_local === id_espaco_local &&
                        com.preco_hora === preco_hora &&
                        com.nome_espaco === nome_espaco
                    );
                    if (!id_espaco_localExistente) {
                        local.precos.push({ preco_hora, id_espaco_local, nome_espaco });
                    }

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
                        id_local_premium,
                        nome_local_premium,
                        latitude,
                        longitude,
                        descricao,
                        precos: id_espaco_local ? [{ preco_hora, id_espaco_local, nome_espaco }] : [],
                        media_avaliacao,
                        imagens: nome_imagem ? [nome_imagem] : [],
                        dias: dia_semana ? [{ dia_semana, horario_inicio, horario_fim }] : [],
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
                res.render(path, { local: formattedResults[0], email: email });
            } else {
                res.status(404).send("Produto não encontrado");
            }

        } catch (error) {
            console.error("Erro ao buscar o produto no banco de dados:", error);
            res.status(500).send("Erro ao buscar o produto");
        }
    };
};

const fazerReserva = async (req, res) => {
    console.log(req.body);
    const { data_reserva, horario_inicio, horario_fim, preco_total, nome_local_premium, selected_espaco } = req.body;
    const email = req.session.email;
    const preco_totalFloat = parseFloat(preco_total);

    const externalReference = JSON.stringify({
        email, data_reserva, horario_inicio, horario_fim, preco_total, selected_espaco
    });

    try {
        const preference = new Preference(client);

        const body = {
            items: [
                {
                    id: `10`,
                    title: `Reservando o local ${nome_local_premium}`,
                    description: `Reservar direto pela +Sport \n Reserva Horario: ${horario_inicio} - ${horario_fim}`,
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: preco_totalFloat,
                }
            ],
            back_urls: {
                success: `https://maissports-tcc.onrender.com/reservaConfirmada`,
                failure: `https://maissports-tcc.onrender.com/reservaConfirmada`,
                pending: `https://maissports-tcc.onrender.com/reservaConfirmada`,
            },
            auto_return: all,
            external_reference: externalReference
        };

        const response = await preference.create({ body });
        res.redirect(response.init_point);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment processing failed' });
    }
};

const reservaConfirmada = async (req, res) => {
    const externalReference = req.query.external_reference;
    const produto = JSON.parse(externalReference);
    const { email, data_reserva, horario_inicio, horario_fim, preco_total, selected_espaco } = produto;
    const precoTotalFloat = parseFloat(preco_total);

    try {
        const { rows: userRows } = await connection.query(
            `SELECT id FROM usuario_clientes WHERE email = $1`,
            [email]
        );

        const fk_id_cliente = userRows[0].id;

        await connection.query(
            `INSERT INTO Reservas (fk_id_cliente, fk_id_espaco_local, data_reserva, horario_inicio, horario_fim, preco_total) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [fk_id_cliente, selected_espaco, data_reserva, horario_inicio, horario_fim, precoTotalFloat]
        );

        req.flash('success_msg', 'Reserva feita com sucesso!');
        res.redirect('/itens-curtidos');
    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar produto: ' + error.message);
        console.log(error);
        res.redirect('/add-product');
    }
};

const pegarReservasFeitas = async (req, res) => {
    const localId = req.query.id;
    const date = req.query.date;

    console.log(date);

    try {
        const query = `
            SELECT id_reserva, horario_inicio, horario_fim 
            FROM Reservas 
            WHERE fk_id_espaco_local = $1 AND data_reserva = $2
        `;
        const { rows: results } = await connection.query(query, [localId, date]);

        const reservas = results.reduce((acc, row) => {
            const { id_reserva, horario_inicio, horario_fim } = row;
            const location = acc.find(local => local.id_reserva === id_reserva);
            if (!location) {
                acc.push({ id_reserva, horario_inicio, horario_fim });
            }
            return acc;
        }, []);

        res.json(reservas);
    } catch (error) {
        console.error("Erro ao buscar locais do banco de dados:", error);
        res.status(500).send("Erro ao buscar locais");
    }
};

const pegarReservas = async (req, res) => {
    const email = req.session.email;

    console.error("Email:", email);
    try {
        const { rows: userRows } = await connection.query(
            `SELECT id FROM usuario_clientes WHERE email = $1`,
            [email]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const fk_id_user = userRows[0].id;

        const query = `
            SELECT r.id_reserva, r.fk_id_espaco_local, r.data_reserva, r.horario_inicio, r.horario_fim, r.preco_total,
                    e.fk_id_local_premium, e.nome_espaco,
                   i.nome_imagem,
                   l.nome_local_premium, l.id_local_premium,
                   u.nome AS nome_cliente, u.sobrenome AS sobrenome_cliente
            FROM Reservas r
            LEFT JOIN espaco_local e ON r.fk_id_espaco_local = e.id_espaco_local
            LEFT JOIN imagens i ON e.fk_id_local_premium = i.fk_local_premium_id
            LEFT JOIN usuario_clientes u ON r.fk_id_cliente = u.id
            LEFT JOIN local_premium l ON e.fk_id_local_premium = l.id_local_premium
            WHERE r.fk_id_cliente = $1
            GROUP BY r.id_reserva, i.nome_imagem, u.nome, u.sobrenome
        `;
        const { rows: results } = await connection.query(query, [fk_id_user]);

        const locais = results.reduce((acc, row) => {
            const { id_reserva, data_reserva, horario_inicio, nome_espaco, horario_fim,
                nome_imagem, preco_total, id_local_premium, nome_local_premium,
                nome_cliente, sobrenome_cliente } = row;

            const location = acc.find(local => local.id_reserva === id_reserva);

            if (location) {
                if (nome_imagem) location.imagens.push(nome_imagem);
            } else {
                acc.push({
                    id_reserva, data_reserva, horario_inicio, nome_espaco, horario_fim,
                    preco_total, id_local_premium, nome_local_premium, nome_cliente, sobrenome_cliente,
                    imagens: nome_imagem ? [nome_imagem] : []
                });
            }
            return acc;
        }, []);

        locais.forEach(location => {
            location.imagens.sort((a, b) => {
                const ordemA = results.find(row => row.nome_imagem === a)?.ordem_img ?? 0;
                const ordemB = results.find(row => row.nome_imagem === b)?.ordem_img ?? 0;
                return ordemA - ordemB;
            });
        });

        res.json(locais);
    } catch (error) {
        console.error("Erro ao buscar locais do banco de dados:", error);
        res.status(500).send("Erro ao buscar locais");
    }
};

const pegarReservasEmpresa = async (req, res) => {
    const email = req.session.email;

    console.error("Email:", email);
    try {
        const { rows: userRows } = await connection.query(
            `SELECT id FROM empresas WHERE email = $1`,
            [email]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const fk_id_emp = userRows[0].id;

        const query = `
            SELECT l.id_local_premium, l.nome_local_premium, 
                e.id_espaco_local, e.preco_hora, e.nome_espaco,
                r.id_reserva, r.data_reserva, r.horario_inicio, r.horario_fim, r.preco_total, 
                i.nome_imagem,
                u.nome AS nome_cliente, u.sobrenome AS sobrenome_cliente
            FROM local_premium l
            LEFT JOIN espaco_local e ON e.fk_id_local_premium = l.id_local_premium
            LEFT JOIN Reservas r ON r.fk_id_espaco_local = e.id_espaco_local
            LEFT JOIN imagens i ON i.fk_local_premium_id = l.id_local_premium
            LEFT JOIN usuario_clientes u ON r.fk_id_cliente = u.id
            WHERE l.fk_id_empresa = $1 AND r.id_reserva IS NOT NULL
            GROUP BY l.id_local_premium, r.id_reserva, i.nome_imagem, u.nome, u.sobrenome
        `;
        const { rows: results } = await connection.query(query, [fk_id_emp]);

        const locais = results.reduce((acc, row) => {
            const { id_local_premium, nome_local_premium, preco_hora, nome_espaco, id_reserva,
                data_reserva, horario_inicio, horario_fim, preco_total, nome_imagem,
                nome_cliente, sobrenome_cliente } = row;

            const location = acc.find(local => local.id_reserva === id_reserva);

            if (location) {
                if (nome_imagem) location.imagens.push(nome_imagem);
            } else {
                acc.push({
                    id_local_premium, nome_local_premium, preco_hora, nome_espaco,
                    id_reserva, data_reserva, horario_inicio, horario_fim, preco_total,
                    nome_cliente, sobrenome_cliente,
                    imagens: nome_imagem ? [nome_imagem] : []
                });
            }
            return acc;
        }, []);

        locais.forEach(location => {
            location.imagens.sort((a, b) => {
                const ordemA = results.find(row => row.nome_imagem === a)?.ordem_img ?? 0;
                const ordemB = results.find(row => row.nome_imagem === b)?.ordem_img ?? 0;
                return ordemA - ordemB;
            });
        });

        res.json(locais);
    } catch (error) {
        console.error("Erro ao buscar locais do banco de dados:", error);
        res.status(500).send("Erro ao buscar locais");
    }
};

module.exports = {
    getLocalReservaById, fazerReserva, reservaConfirmada, pegarReservas, pegarReservasEmpresa, pegarReservasFeitas,
};
