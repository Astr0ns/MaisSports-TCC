const { validationResult } = require("express-validator");
const usuario = require("./usuarioModel");
const bcrypt = require("bcrypt");

function authMiddleware(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

module.exports = authMiddleware;



// const meuMiddleware = (req, res, next)=>{

//     // logica do seu middleware
//     // ...
//     // ...
//     // use req para recuperar dados do servidor
//     // use o res para enviar dados para o cliente 
//     // ...
//     // ...

//     next()//utilizado para prosseguir para o próximo middleware ou rota
// }

// if(tipo_usuario = empresa){
//
// }