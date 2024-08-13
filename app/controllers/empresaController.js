const usuario = require("../models/usuarioModel");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(12);
const { removeImg } = require("../util/removeImg");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const https = require('https');

gravarEmpresa: async (req, res) => {
    try{
        let results = await usuario.findId(req.session.autenticado.id);
        if(results[0].cep != null){
            const httpsAgent = new https.Agent({
                rejectUnauthorized: false,
            });
            
            if(!req.file) {
                console.log("falha no carregamento");
            }else{
                caminhoArquivo = "imagem/empresa/" + req.file.filename;
                if(dadosForm.img_produto_pasta != caminhoArquivo){

                }
                dadosForm.img_produto_pasta = caminhoArquivo;
                dadosForm.img_produto_banco = null;

            }
            let resultUpdate = await empresa.update(dadosForm, req.session.autenticado.id);
            id(!resultUpdate.isEmpty){
                if(resultUpdate.changeRows == 1) {
                    var result = await empresa.findId(req.session.autenticado.id);
                    var autenticado = {
                        id: result[0].id,
                        tipo: result[0].tipo,
                        img_produto_banco: result[0].img_produto_banco != null ? `data:image/jpeg;base64, ${result[0].img_produto_banco.toString('base64')}`: null,
                        img_produto_pasta: result[0].img_produto_pasta
                    };
                    req.session.autenticado = autenticado;
                    var campos = {
                        nome_prod: result[0].nome_prod, email_prod: result[0].email.empresa,
                        img_produto_pasta: result[0].img_produto_pasta, img_produto_banco: result[0].img_produto_banco,
                        nome_prod:result[0].user_empr, celular
                    }
                }
            }
        }
    }catch{

    }
}

module.exports(
    gravarEmpresa,
)

