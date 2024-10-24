var connection = require("../../config/pool_conexoes");
const express = require('express');

exports.verificarDisponibilidade = async (req, res) => {
    const { id_local, data_reserva } = req.body;

    try {
        // Conversão do dia da semana para português
        const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
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