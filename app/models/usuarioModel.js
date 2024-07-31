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

    findId: async (id) => {
        try {
            const [resultados] = await pool.query(
                "SELECT u.id_usuario, u.nome_usuario, u.user_usuario, " +
                "u.senha_usuario, u.email_usuario, u.fone_usuario, u.tipo_usuario, " +
                "u.status_usuario,u.numero_usuario, u.cep_usuario,u.img_perfil_banco, u.img_perfil_pasta," +
                "t.id_tipo_usuario, t.descricao_usuario " +
                "FROM usuario u, tipo_usuario t where u.status_usuario = 1 and " +
                "u.tipo_usuario = t.id_tipo_usuario and u.id_usuario = ? ", [id]
            )
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
};
