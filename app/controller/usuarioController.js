const usuario = require("../models/usuarioModel");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(12);
const { removeImg } = require("../util/removeImg");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const https = require('https');

const usuarioController = {
    cadastrar: (req, res) => {
        const erros = validationResult(req);
        var dadosForm = {
            user_usuario: req.body.nomeusu_usu,
            senha_usuario: bcrypt.hashSync(req.body.senha_usu, salt),
            nome_usuario: req.body.nome_usu,
            email_usuario: req.body.email_usu,
        };
        if (!erros.isEmpty()) {
            return res.render("pages/cadastro", { listaErros: erros, dadosNotificacao: null, valores: req.body })
        }
        try {
            let create = usuario.create(dadosForm);
            res.render("pages/cadastro", {
                listaErros: null, dadosNotificacao: {
                    titulo: "Cadastro realizado!", mensagem: "Novo usuário criado com sucesso!", tipo: "success"
                }, valores: req.body
            })
        } catch (e) {
            console.log(e);
            res.render("pages/cadastro", {
                listaErros: erros, dadosNotificacao: {
                    titulo: "Erro ao cadastrar!", mensagem: "Verifique os valores digitados!", tipo: "error"
                }, valores: req.body
            })
        }
    },
}