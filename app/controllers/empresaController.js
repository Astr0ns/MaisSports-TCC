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
                if(dadosForm.img_perfil_pasta != caminhoArquivo){

                }
                dadosForm.img_perfil_pasta = caminhoArquivo;
                dadosForm.img_perfil_banco = null;

            }
            let resultUpdate = await empresa.update(dadosForm, req.session.autenticado.id);
        }
    }
}

