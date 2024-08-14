var pool = require("../../config/pool_conexoes");

const gravarUsuAutenticado = (req, res, next) => {
    // Lógica para gravar usuário autenticado (pode ser usada para auditoria ou estatísticas)
    if (req.session.userId) {
        console.log(`Usuário autenticado: ${req.session.userId}`);
    }
    next();
};

module.exports = {
    gravarUsuAutenticado
};
