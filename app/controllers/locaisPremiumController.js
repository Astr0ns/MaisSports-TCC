var connection = require("../../config/pool_conexoes");
const express = require('express');

const adicionarLocaisPremium = async (req, res) => {
    const { nome_local, local_category, preco_hora,  desc_local, latitude, longitude, horarios } = req.body;
    const email = req.session.email;

    const parsedHorarios = JSON.parse(horarios);

    console.log("Horários recebidos (como objeto):", parsedHorarios);
    

    console.log(nome_local)
    console.log(local_category)
    console.log(preco_hora)
    console.log(desc_local)
    console.log(latitude)
    console.log(longitude)
    // console.log("Horários recebidos:", horarios);

    for (let chave in parsedHorarios) {
        console.log(chave);
        console.log(chave + ": " + parsedHorarios[chave].inicio);
        console.log(chave + ": " + parsedHorarios[chave].fim);
    }
      



    

    try {
         // Obtém o ID da empresa
        //  const [user] = await connection.query(
        //     `SELECT id FROM empresas WHERE email = ?`,
        //     [email]
        // );

        // if (endExist.length === 0) {
        //     req.flash('error_msg', 'Empresa não encontrada');
        //     return res.redirect('/locais-esportivos');
        // }

        //const fk_id_emp = user[0].id; // Atribuindo fk_id_emp
        const fk_id_emp = 25;

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
            [fk_id_emp, nome_local, local_category, latitude, longitude, desc_local, preco_hora]
        );

        const locaisId = addL.insertId;

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

module.exports ={ 
    adicionarLocaisPremium,
}