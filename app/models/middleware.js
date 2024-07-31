const { validationResult } = require("express-validator");
const usuario = require("./usuarioModel");
const bcrypt = require("bcrypt");

verificarUsuAutenticado = (req, res, next) =>{
    if(req.session.autenticado){
        var autenticado = req.session.autenticado;
    }else{
        var autenticado = { autenticado: null, id: null, tipo: null };
    }
    req.session.autenticado = autenticado;
    next();
}

limparSessao = (req, res, next) => {
    req.session.destroy();
    next()
}

gravarUsuAutenticado = async (req, res, next) => {
    erros = validationResult(req)
    if(erros.isEmpty()) {
        var dadosForm = {
            email: req.body.email,
            senha: req.body.senha,
        };
        var results = await usuario.findUserEmail(dadosForm);
    var total = Object.keys(results).length;
    if (total == 1) {
      if (bcrypt.compareSync(dadosForm.senha_cliente, results[0].senha_cliente)) {
        var autenticado = {
          autenticado: results[0].nome,
          id: results[0].id_cliente,
          tipo: results[0].tipo_cliente,
          img_perfil_banco: results[0].img_perfil_banco != null ? `data:image/jpeg;base64,${results[0].img_perfil_banco.toString('base64')}` : null,
          img_perfil_pasta: results[0].img_perfil_pasta,
        };
      }
    }
  }
  req.session.autenticado = autenticado;
  req.session.logado = 0;
  next();
};

verificarUsuAutorizado = (tipoPermitido, destinoFalha) => {
  return (req, res, next) => {
    if (
      req.session.autenticado.autenticado != null &&
      tipoPermitido.find(function (element) {
        return element == req.session.autenticado.tipo;
      }) != undefined
    ) {
      next();
    } else {
      res.render(destinoFalha, req.session.autenticado);
    }
  };
};

module.exports = {
  verificarUsuAutenticado,
  limparSessao,
  gravarUsuAutenticado,
  verificarUsuAutorizado,
};



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