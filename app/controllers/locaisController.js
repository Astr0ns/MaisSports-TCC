const adicionarLocais = async (req, res) => {
    const { nome, categoria, descricao, latitude, longitude } = req.body;
    const images = req.files; // Caso você use imagens, deve adicionar lógica para isso.

    try {
        const [localExist] = await connection.query(
            "SELECT id FROM locais WHERE latitude = ? AND longitude = ?",
            [latitude, longitude]
        );

        if (localExist.length > 0) {
            req.flash('error_msg', 'O local já foi adicionado.');
            return res.redirect('/locais-esportivos');
        }

        const [addL] = await connection.query(
            `INSERT INTO locais (nome, categoria, descricao, latitude, longitude) VALUES (?, ?, ?, ?, ?)`,
            [nome, categoria, descricao, latitude, longitude]
        );

        req.flash('success_msg', 'Local adicionado com sucesso!');
        const locaisId = addL.insertId;

        // Você pode redirecionar para outra página aqui ou enviar uma resposta.
        res.redirect('/locais-esportivos'); // Redirecionar após sucesso

    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar Local: ' + error.message);
        res.redirect('/locais-esportivos');
    }
};
