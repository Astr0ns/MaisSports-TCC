const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const connection = require("../../config/pool_conexoes");

const regrasValidacaoFormLogin = [
    body('email').isEmail().withMessage('Insira um email válido').normalizeEmail(),
    body('senha').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres')
];

const logar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('pages/login', {
            userId: req.session.userId,
            listaErros: errors.array(),
            dadosNotificacao: null,
            valores: { nome_usu: "", nomeusu_usu: "", email_usu: req.body.email, senha_usu: "" },
        });
    }

    const { email, senha } = req.body;

    try {
        const result = await connection.query(
            "SELECT * FROM usuario_clientes WHERE email = $1 LIMIT 1",
            [email]
        );

        if (result.rows.length > 0) {
            const account = result.rows[0];
            const passwordMatch = await bcrypt.compare(senha, account.senha);

            if (!passwordMatch) {
                req.flash('msg', "As senhas não conferem");
                return res.redirect('/login');
            }

            req.session.email = account.email;
            req.session.celular = account.celular;
            req.session.nome = account.nome;
            req.session.userId = account.id;
            req.session.sobrenome = account.sobrenome;
            req.session.userTipo = account.tipo;
            req.session.logado = true;

            req.flash('msg', "Logado com sucesso");
            return res.redirect('/profile');

        } else {
            req.flash('msg', "Usuário não encontrado");
            return res.redirect('/login');
        }

    } catch (err) {
        console.error("Erro na consulta: ", err);
        return res.status(500).send('Erro interno do servidor');
    }
};

const registrarUsu = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('pages/register', {
            userId: req.session.userId,
            listaErros: errors.array(),
            dadosNotificacao: null,
            valores: { nome_usu: "", nomeusu_usu: "", email_usu: req.body.email, senha_usu: "" },
        });
    }

    const { nome, email, senha } = req.body;

    if (senha !== req.body.cSenha) {
        req.flash('error_msg', 'As senhas não conferem.');
        return res.redirect('/register');
    }

    try {
        const emailExist = await connection.query(
            "SELECT id FROM usuario_clientes WHERE email = $1",
            [email]
        );

        if (emailExist.rows.length > 0) {
            req.flash('error_msg', 'Email já está em uso.');
            return res.redirect('/register');
        }

        const salt = bcrypt.genSaltSync(12);
        const hash = bcrypt.hashSync(senha, salt);

        await connection.query(
            "INSERT INTO usuario_clientes (nome, email, senha, celular, logradouro, cep) VALUES ($1, $2, $3, $4, $5, $6)",
            [nome, email, hash, '00000000000', 'Logradouro Exemplo', '00000000']
        );

        req.flash('success_msg', 'Registro bem-sucedido!');
        res.redirect('/register?success=true');

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Erro ao criar usuário. Tente novamente mais tarde.');
        res.redirect('/register');
    }
};

const alterDados = async (req, res) => {
    const email = req.session.email;
    const userId = req.session.userId;

    try {
        if (!email) throw new Error('Usuário não autenticado.');

        const result = await connection.query(
            "SELECT cep, numero, logradouro, bairro, cidade, estado, celular FROM usuario_clientes WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) throw new Error('Usuário não encontrado.');

        const { cep, numero, logradouro, bairro, cidade, estado, celular } = result.rows[0];
        res.render('pages/alter', { email, cep, numero, logradouro, bairro, cidade, estado, celular, userId });
    } catch (error) {
        console.error('Erro ao obter dados:', error);
        res.status(500).send('Erro ao obter dados do usuário.');
    }
};

const guardarCelular = async (req, res) => {
    try {
        const userId = req.session.userId;
        const novoCelular = req.body.celular;

        if (!userId) throw new Error('Usuário não autenticado.');

        const rows = await connection.query("SELECT id FROM usuario_clientes WHERE id = $1", [userId]);
        if (rows.rows.length === 0) throw new Error('Usuário não encontrado.');

        await connection.query("UPDATE usuario_clientes SET celular = $1 WHERE id = $2", [novoCelular, userId]);

        req.flash('success_msg', 'Número de celular salvo com sucesso!');
        res.redirect('/alter');
    } catch (error) {
        console.error('Erro ao atualizar celular:', error);
        res.status(500).send('Erro ao atualizar celular');
    }
};

const excluirOuAlterarCelular = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) throw new Error('Usuário não autenticado.');

        const { acao } = req.body;

        if (acao === 'excluir') {
            await connection.query("UPDATE usuario_clientes SET celular = NULL WHERE id = $1", [userId]);
        } else {
            throw new Error('Ação inválida.');
        }

        req.flash('success_msg', 'Celular atualizado com sucesso!');
        res.redirect('/alter');
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).send('Erro ao atualizar celular');
    }
};

const guardarCEP = async (req, res) => {
    const { cep, numero, logradouro } = req.body;
    const email = req.session.email;

    if (!email) return res.status(400).send('Erro: Usuário não está logado.');

    try {
        const rows = await connection.query("SELECT * FROM usuario_clientes WHERE email = $1", [email]);
        if (rows.rows.length === 0) throw new Error('Usuário não encontrado.');

        await connection.query(
            "UPDATE usuario_clientes SET cep = $1, numero = $2, logradouro = $3 WHERE email = $4",
            [cep, numero, logradouro, email]
        );

        req.flash('success_msg', "Endereço atualizado com sucesso!");
        return res.redirect('/alter');
    } catch (error) {
        console.error('Erro ao salvar endereço:', error);
        req.flash('error_msg', 'Erro ao salvar o endereço.');
        return res.redirect('/alter');
    }
};

const excluirOuRedefinirEndereco = async (req, res) => {
    const email = req.session.email;
    if (!email) return res.status(400).send('Erro: Usuário não está logado.');

    const { acao } = req.body;

    try {
        if (acao === 'excluir') {
            await connection.query(
                "UPDATE usuario_clientes SET cep = NULL, numero = NULL, logradouro = NULL WHERE email = $1",
                [email]
            );
        } else if (acao === 'redefinir') {
            await connection.query(
                "UPDATE usuario_clientes SET cep = '0', numero = '0', logradouro = '' WHERE email = $1",
                [email]
            );
        } else {
            throw new Error('Ação inválida.');
        }

        return res.redirect('/alter');
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).send('Erro ao excluir ou redefinir endereço.');
    }
};

module.exports = {
    regrasValidacaoFormLogin, logar, registrarUsu, alterDados,
    guardarCelular, guardarCEP, excluirOuAlterarCelular, excluirOuRedefinirEndereco,
};
