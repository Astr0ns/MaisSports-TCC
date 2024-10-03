var connection = require("../../config/pool_conexoes");
const express = require('express');

const adicionarLocais = async (req, res) => {
    const { nome, categoria, descricao, latitude, longitude } = req.body;
    console.log(req.body);
    try {
        // Verifica se o local já existe
        const [endExist] = await connection.query(
            "SELECT * FROM locais WHERE latitude = ? AND longitude = ?",
            [latitude, longitude]
        );
        
        if (endExist.length > 0) {
            req.flash('error_msg', 'Esse endereço já foi adicionado ao Sports Map.');
            return res.redirect('/locais-esportivos'); // Redireciona para o formulário
        }
        
        // Insere o novo local
        const [addL] = await connection.query(
            `INSERT INTO locais (nome, categoria, descricao, latitude, longitude) VALUES (?, ?, ?, ?, ?)`,
            [nome, categoria, descricao, latitude, longitude]
        );

        req.flash('success_msg', 'Local adicionado com sucesso!');
        const locaisId = addL.insertId;

        // Armazena informações na sessão do usuário
        req.session.nome = nome;

        // Redireciona após sucesso
        res.redirect('/locais-esportivos'); 

    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar Local: ' + error.message);
        console.log(error);
        res.redirect('/locais-esportivos');
    }
};


const locaisBanco = async (req, res) => {
    const { categoria } = req.query; // Pega a categoria da query string

    try {
        const query = "SELECT nome, latitude, longitude FROM locais WHERE categoria = ?";
        const [results] = await connection.query(query, [categoria]); // Filtra pela categoria
        res.json(results);
    } catch (error) {
        console.error("Erro ao buscar locais do banco de dados:", error);
        res.status(500).send("Erro ao buscar locais");
    }
};


module.exports ={ 
    adicionarLocais, locaisBanco,
}
