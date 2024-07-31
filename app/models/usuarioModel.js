var pool = require("../../config/pool_conexoes");

const usuarioModel = {
    findAll: async () => {
        try {
            const [resultados] = await pool.query(
                "SELECT u.id_cliente, u.nome_cliente, " +
                "u.senha_cliente, u.email_cliente, u.celular_cliente, u.tipo_cliente, " +
                "u.status, t.tipo_cliente, t.descricao " +
                "FROM usuario_clientes u, tipo_cliente t where u.status = 1 and " +
                "u.tipo_cliente = t.id_tipo_cliente"
            )
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
    findUserEmail: async (camposForm) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM usuario_clientes WHERE email_cliente = ?",
                [camposForm.email_cliente, camposForm.email_cliente]
            )
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
    create: async (camposForm) => {
        try {
            const [resultados] = await pool.query(
                "insert into usuario_clientes set ?", [camposForm]
            )
            return resultados;
        } catch (error) {
            console.log(error);
            return null;
        }
    },
    update: async (camposForm, id) => {
        try {
            const [resultados] = await pool.query(
                "UPDATE cliente SET ? " +
                " WHERE id_cliente = ?",
                [camposForm, id]
            )
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    delete: async (id) => {
        try {
            const [resultados] = await pool.query(
                "UPDATE cliente SET status_cliente = 0 WHERE id_cliente = ? ", [id]
            )
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    fazerRegistro: async function (req, res) {
        const { nome, sobrenome, email, senha, cSenha } = req.body;
        // Verificar se as senhas coincidem
        if (senha !== cSenha) {
            req.flash('msg', "As senhas não coincidem");
            console.log(req.flash()); // Adicione este console log para verificar as mensagens flash
            res.render('pages/register', { email: email, messages: req.flash() });
        }
    
        console.log(req.flash('msg')); // Verifica se a mensagem está sendo corretamente definida
    
        try {
    
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(senha, salt);
    
            // Consultar se o email já está registrado
            const [rows] = await connection.query("SELECT id_cliente FROM usuario_clientes WHERE email_cliente = ?", [email]);
    
            // Se encontrou algum registro com o mesmo email, exibir mensagem de erro
            if (rows.length > 0) {
                req.flash('msg', "Usuario em uso.");
                console.log(req.flash()); // Adicione este console log para verificar as mensagens flash
                res.render('pages/register', { email: email, messages: req.flash() });
            }
    
            // Se o email não existe no banco de dados, inserir o novo registro
            await connection.query("INSERT INTO usuario_clientes (nome_cliente, sobrenome_cliente, email_cliente, senha_cliente) VALUES (?, ?, ?, ?)", [nome, sobrenome, email, hashedPassword]);
    
            // Redirecionar para a página de login ou outra página após o registro
            req.flash("success_msg", "Registro realizado com sucesso!");
            res.render('pages/login', { pagina: "login", logado: null });
    
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    }
};
