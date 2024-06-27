var pool = required("../../config/pool_conexoes");

const userModel = {
    create: async (dadosForm) => {
        try{
            const [resposta] = await pool.query('SELECT * FROM maissports WHERE usuario_clientes = 1 limit ?, ?', [pagina,total])
            return resposta;
        }catch {error} {
            return error
        }
    }
}

module.exports = userModel;