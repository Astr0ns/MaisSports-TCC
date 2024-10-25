var connection = require("../../config/pool_conexoes");
const express = require('express');

const adicionarLocaisPremium = async (req, res) => {
    const { nome_local, local_category, desc_local, latitude, longitude } = req.body;
    const email = req.session.email;

    try {
         // Obtém o ID da empresa
         const [user] = await connection.query(
            `SELECT id FROM empresas WHERE email = ?`,
            [email]
        );

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

        // Insere o novo local
        const [addL] = await connection.query(
            `INSERT INTO local_premium (fk_id_empresa, nome_local_premium, categoria, latitude, longitude, descricao, preco_hora) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [fk_id_emp, nome_local, local_category, latitude, longitude, desc_local]
        );

        const locaisId = addL.insertId;

        const horarios = {
            'Quinta': { inicio: '09:00:00', fim: '18:00:00' },
            'Sexta': { inicio: '09:00:00', fim: '21:00:00' },
            'Sábado': { inicio: '10:00:00', fim: '18:00:00' },
            'Domingo': { inicio: '10:00:00', fim: '16:00:00' }
        };
        
        for (const dia_semana in horarios) {
            const { inicio, fim } = horarios[dia_semana];
        
            const [dia_atua] = await connection.query(
                `INSERT INTO dia_atuacao (fk_id_local_premium, dia_semana, horario_inicio, horario_fim) VALUES (?, ?, ?, ?)`,
                [locaisId, dia_semana, inicio, fim]
            );
        }

        // for (const dia_semana of diasSemana) {
        //     const [add] = await connection.query(
        //         `INSERT INTO dia_atuacao (fk_id_local_premium, dia_semana, horario_inicio, horario_fim) VALUES (?, ?, ?, ?)`,
        //         [locaisId, dia_semana, horarioInicio, horarioFim]
        //     );
        // }

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

module.exports ={ 
    adicionarLocaisPremium,
}