var pool = require("../../config/pool_conexoes");

const usuarioModel = {
    findAll: async () => {
        try {
            const [resultados] = await pool.query(
                "SELECT u.id, u.nome_cliente, " +
                "u.senha_cliente, u.email_cliente, u.celular_cliente, u.tipo_cliente, " +
                ", t.tipo_cliente, t.descricao " +
                "FROM usuario_clientes u, tipo_cliente t where  = 1 and " +
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
                "UPDATE usario_clientes SET ? " +
                " WHERE id = ?",
                [camposForm, id]
            )
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    findId: async (id) => {
        try {
            const [resultados] = await pool.query(
                "SELECT u.id, u.nome, u.user, " +
                "u.senha, u.email, u.celular, u.tipo, " +
                "u.numero, u.cep, u.img_perfil_banco, u.img_perfil_pasta," +
                "t.id_tipo, t.descricao " +
                "FROM usuario u, tipo t where = 1 and " +
                "u.tipo_cliente = t.id_tipo_cliente and u.id = ? ", [id]
            )
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
};
