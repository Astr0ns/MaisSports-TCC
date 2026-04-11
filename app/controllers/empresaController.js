const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const connection = require("../../config/pool_conexoes");

const regrasValidacaoFormLogin = [];

const registrarEmpr = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('pages/regs-empr', {
            userId: req.session.userId,
            listaErros: errors.array(),
            dadosNotificacao: null,
            valores: { nome_usu: "", nomeusu_usu: "", email_usu: req.body.email, senha_usu: "" },
        });
    }

    const { nome, cnpj, email, senha, cSenha } = req.body;

    if (senha !== cSenha) {
        req.flash('error_msg', 'As senhas não conferem.');
        return res.redirect('/regs-empr');
    }

    try {
        const existingRecords = await connection.query(
            "SELECT id FROM empresas WHERE email = $1 OR cnpj = $2",
            [email, cnpj]
        );

        if (existingRecords.rows.length > 0) {
            req.flash('error_msg', 'Email ou CNPJ já em uso.');
            return res.redirect('/regs-empr');
        }

        const hash = await bcrypt.hash(senha, 12);

        await connection.query(
            "INSERT INTO empresas (nome, cnpj, email, senha, tipo, cep, logradouro) VALUES ($1, $2, $3, $4, 'empresa', '00000000', '0000')",
            [nome, cnpj, email, hash]
        );

        req.flash('success_msg', 'Registro bem-sucedido!');
        return res.redirect('/login-empr');

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao criar empresa. Tente novamente mais tarde.');
        return res.redirect('/regs-empr');
    }
};

const logarEmpr = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const result = await connection.query(
            "SELECT * FROM empresas WHERE email = $1 LIMIT 1",
            [email]
        );

        if (result.rows.length > 0) {
            const account = result.rows[0];
            const passwordMatch = await bcrypt.compare(senha, account.senha);

            if (!passwordMatch) {
                req.flash('error_msg', "As senhas não conferem");
                return res.redirect('/login-empr');
            }

            req.session.email = account.email;
            req.session.celular = account.celular;
            req.session.nome = account.nome;
            req.session.userId = account.id;
            req.session.sobrenome = account.cnpj;
            req.session.userTipo = account.tipo;
            req.session.logado = true;

            req.flash('success_msg', "Logado com sucesso");
            return res.redirect('/painel-empresa');

        } else {
            req.flash('error_msg', "Usuário não encontrado");
            return res.redirect('/login-empr');
        }

    } catch (err) {
        console.error("Erro na consulta: ", err);
        return res.status(500).send('Erro interno do servidor');
    }
};

const verSeEmpresa = async (req, res) => {
    const email = req.session.email;
    const nome = req.session.nome;

    try {
        const resultClientes = await connection.query(
            "SELECT * FROM usuario_clientes WHERE email = $1",
            [email]
        );

        if (resultClientes.rows.length > 0) {
            const usuario = resultClientes.rows[0];
            res.render("pages/profile", { user: usuario, nome: nome, email: email });
        } else {
            const resultEmpresas = await connection.query(
                "SELECT * FROM empresas WHERE email = $1",
                [email]
            );

            if (resultEmpresas.rows.length > 0) {
                const empresa = resultEmpresas.rows[0];
                res.render("pages/painel-empresa", { company: empresa, nome: nome, email: email });
            } else {
                res.render("pages/login");
            }
        }
    } catch (error) {
        console.error("Erro ao buscar dados no banco de dados:", error);
        res.status(500).send("Erro ao buscar dados");
    }
};

module.exports = {
    regrasValidacaoFormLogin,
    logarEmpr,
    registrarEmpr,
    verSeEmpresa,
};
