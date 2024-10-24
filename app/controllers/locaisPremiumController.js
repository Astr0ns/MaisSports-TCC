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