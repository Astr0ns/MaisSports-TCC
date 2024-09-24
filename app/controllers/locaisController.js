const adicionarLocais = async  (req, res) => {
    const { nome, categoria, descricao, latitude, longitude } = req.body;
    console.log('sadasdasd');
    try {
        const [addL] = await connection.query(
            `INSERT INTO locais (nome, categoria, descricao, latitude, longitude) VALUES (?, ?, ?, ?, ?)`,
            [nome, categoria, descricao, latitude, longitude]
        );
        console.log(addL);
        req.flash('success_msg', 'Local adicionado com sucesso!');
        const locaisId = addL.insertId;

        // Você pode redirecionar para outra página aqui ou enviar uma resposta.
        res.redirect('/locais-esportivos'); // Redirecionar após sucesso

    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar Local: ' + error.message);
        console.log('adasdasda')
        res.redirect('/locais-esportivos');
    }
};

module.exports ={ 
    adicionarLocais
}
