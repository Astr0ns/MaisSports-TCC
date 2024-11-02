const path = require('path');
var connection = require("../../config/pool_conexoes");
const multer = require('multer');
const { MercadoPagoConfig, Preference } = require('mercadopago'); // Import Preference
const { all } = require('../routes/productRouter');

// Inicialize o cliente Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: 'APP_USR-5246075068010463-102011-9f4c949634a04fdbbf0193af72dd4988-428968371',
    options: { timeout: 5000, idempotencyKey: 'abc' }
});

const verificarDisponibilidade = async (req, res) => {
    const { id_local, data_reserva } = req.body;

    try {
        // Conversão do dia da semana para português
        const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        const diaSemana = diasSemana[new Date(data_reserva).getDay()];

        // Busca os dias de atuação do local
        const [diasAtuacao] = await pool.query(`
            SELECT * 
            FROM dia_atuacao 
            WHERE fk_id_local_premium = ? AND dia_semana = ?
        `, [id_local, diaSemana]);

        if (diasAtuacao.length === 0) {
            return res.status(404).json({ message: 'Local não atua nesse dia.' });
        }

        // Busca as reservas já feitas para o local e o dia desejado
        const [reservas] = await pool.query(`
            SELECT * 
            FROM Reserva 
            WHERE fk_id_local_premium = ? AND data_reserva = ?
        `, [id_local, data_reserva]);

        // Verifica os horários disponíveis comparando com as reservas existentes
        const horariosDisponiveis = diasAtuacao.filter(dia => {
            return !reservas.some(reserva =>
                (reserva.horario_inicio >= dia.horario_inicio && reserva.horario_inicio < dia.horario_fim) ||
                (reserva.horario_fim > dia.horario_inicio && reserva.horario_fim <= dia.horario_fim)
            );
        });

        if (horariosDisponiveis.length === 0) {
            return res.status(400).json({ message: 'Não há horários disponíveis para esta data.' });
        }

        return res.json(horariosDisponiveis);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao verificar disponibilidade.', error });
    }
};

// Faz uma nova reserva
const criarReserva = async (req, res) => {
    const { id_usuario, id_local, data_reserva, horario_inicio, horario_fim } = req.body;

    try {
        // Verifica se o local está disponível no horário desejado
        const [reservasExistentes] = await pool.query(`
            SELECT * 
            FROM Reserva 
            WHERE fk_id_local_premium = ? AND data_reserva = ? 
            AND (horario_inicio BETWEEN ? AND ? OR horario_fim BETWEEN ? AND ?)
        `, [id_local, data_reserva, horario_inicio, horario_fim, horario_inicio, horario_fim]);

        if (reservasExistentes.length > 0) {
            return res.status(400).json({ message: 'Horário indisponível.' });
        }

        // Buscar o preço por hora do local
        const [local] = await pool.query(`
            SELECT preco_hora 
            FROM local_premium 
            WHERE id_local_premium  = ?
        `, [id_local]);

        if (local.length === 0) {
            return res.status(404).json({ message: 'Local não encontrado.' });
        }

        const precoHora = local[0].preco_hora;

        // Calcular o preço total com base nas horas reservadas
        const horasReservadas = (new Date(`1970-01-01T${horario_fim}Z`) - new Date(`1970-01-01T${horario_inicio}Z`)) / 1000 / 60 / 60;
        const precoTotal = horasReservadas * precoHora;

        // Inserir a nova reserva
        const [resultado] = await pool.query(`
            INSERT INTO Reserva (fk_id_cliente, fk_id_local_premium , data_reserva, horario_inicio, horario_fim, preco_total)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id_usuario, id_local, data_reserva, horario_inicio, horario_fim, precoTotal]);

        return res.json({ id_reserva: resultado.insertId, preco_total: precoTotal });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar reserva.', error });
    }
};

const getLocalReservaById = (path) => {
    return async (req, res) => {
        const localId = req.params.id;
        const email = req.session.email; // Pega o email da sessão, se estiver definido
        try {
            const query = `
                SELECT l.id_local_premium, l.nome_local_premium, l.latitude, l.longitude, l.descricao, l.preco_hora,
                    d.dia_semana, d.horario_inicio, d.horario_fim,
                    i.nome_imagem, a.comentario_local, a.avaliacao_estrela_locais,
                    u.nome AS nome_cliente, u.sobrenome AS sobrenome_cliente,
                    AVG(a.avaliacao_estrela_locais) AS media_avaliacao  -- Calcula a média das avaliações
                FROM local_premium l
                LEFT JOIN imagens i ON l.id_local_premium = i.fk_local_premium_id
                LEFT JOIN avaliacao_local a ON l.id_local_premium = a.fk_id_local_premium 
                LEFT JOIN usuario_clientes u ON a.fk_id_cliente = u.id 
                LEFT JOIN dia_atuacao d on l.id_local_premium = d.fk_id_local_premium 
                WHERE l.id_local_premium = ?
                GROUP BY l.id_local_premium, i.nome_imagem, d.dia_semana, a.comentario_local, u.nome, u.sobrenome -- Agrupa os resultados para evitar duplicação
            `;
            const [results] = await connection.query(query, [localId]);

            const formattedResults = results.reduce((acc, row) => {
                const { id_local_premium,nome_local_premium, latitude, longitude, descricao, preco_hora, dia_semana, horario_inicio, horario_fim, nome_imagem, comentario_local, avaliacao_estrela_locais, nome_cliente, sobrenome_cliente, media_avaliacao } = row;
                const local = acc.find(loc => loc.nome_local_premium === nome_local_premium);
                
                if (local) {
                    // Adiciona as imagens, sem duplicar
                    if (nome_imagem && !local.imagens.includes(nome_imagem)) {
                        local.imagens.push(nome_imagem);
                    }

                    if (dia_semana) {
                        local.dias.push({
                            dia_semana,
                            horario_inicio,
                            horario_fim
                        });
                    }
                    
                    // Adiciona os comentários, sem duplicar
                    const comentarioExistente = local.comentarios.find(com => 
                        com.comentario_local === comentario_local &&
                        com.cliente === `${nome_cliente} ${sobrenome_cliente}`
                    );
                    
                    if (!comentarioExistente) {
                        local.comentarios.push({
                            comentario_local,
                            avaliacao_estrela_locais,
                            cliente: `${nome_cliente} ${sobrenome_cliente}`
                        });
                    }
                } else {
                    acc.push({
                        id_local_premium,
                        nome_local_premium,
                        latitude,
                        longitude,
                        descricao,
                        preco_hora,
                        media_avaliacao, // Inclui a média de avaliação
                        imagens: nome_imagem ? [nome_imagem] : [],
                        dias: dia_semana ? [{
                            dia_semana,
                            horario_inicio,
                            horario_fim
                        }] : [],
                        comentarios: comentario_local ? [{
                            comentario_local,
                            avaliacao_estrela_locais,
                            cliente: `${nome_cliente} ${sobrenome_cliente}`
                        }] : []
                    });
                }
    
                return acc;
            }, []);

            if (formattedResults.length > 0) {
                
                // res.json(formattedResults);
                res.render(path, { local: formattedResults[0], email: email }) ; // Usa o caminho passado
            } else {
                res.status(404).send("Produto não encontrado");
            }
    
            
        } catch (error) {
            console.error("Erro ao buscar o produto no banco de dados:", error);
            res.status(500).send("Erro ao buscar o produto");
        }
    };
};


// adicionarProd

const fazerReserva = async (req, res) => {
    console.log(req.body); // Veja os dados que estão chegando
    const { data_reserva, horario_inicio, horario_fim, preco_total, id_local_premium, nome_local_premium } = req.body;
    const email = req.session.email;
    const preco_totalFloat = parseFloat(preco_total);
    console.log(`Reservando o local ${nome_local_premium}`,
        `Reservar direto pela +Sport \n Reserva Horario: ${horario_inicio} - ${horario_fim}`)
    
    const externalReference = JSON.stringify({
        email,
        data_reserva, 
        horario_inicio, 
        horario_fim, 
        preco_total, 
        id_local_premium
    });

    try {
        const preference = new Preference(client);

        // Crie o corpo da requisição de pagamento com dados vindos do cliente (ex: frontend)
        const body = {
            items: [
                {
                    id: `10`,
                    title: `Reservando o local ${nome_local_premium}`,
                    description: `Reservar direto pela +Sport \n Reserva Horario: ${horario_inicio} - ${horario_fim}`,
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: preco_totalFloat,
                }
                
            ],
            back_urls: {
                success: `https://fuzzy-computing-machine-g47rjr6rr7qxfp6r-3000.app.github.dev/reservaConfirmada`, // URL para sucesso
                failure: `https://fuzzy-computing-machine-g47rjr6rr7qxfp6r-3000.app.github.dev/adicionar-produto-falha`, // URL para falha
                pending: `https://fuzzy-computing-machine-g47rjr6rr7qxfp6r-3000.app.github.dev/adicionar-produto-pendente`, // URL para pendente
            },
            auto_return: all,
            external_reference: externalReference // Armazena os dados aqui
        };

        // Faça a requisição de pagamento
        const response = await preference.create({ body });
        // Retorne a resposta para o frontend
        
        res.redirect(response.init_point);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment processing failed' });
    }
};

const reservaConfirmada = async (req, res) => {
    
    
    const externalReference = req.query.external_reference;

    const produto = JSON.parse(externalReference);
    const { email, data_reserva, horario_inicio, horario_fim, preco_total, id_local_premium} = produto;
    const precoTotalFloat = parseFloat(preco_total);


    try {
        // 1. Busca o ID do cliente (usuário) baseado no email
        const [user] = await connection.query(
            `SELECT id FROM usuario_clientes WHERE email = ?`,
            [email]
        );

        const fk_id_cliente = user[0].id;

        // Insira o novo produto na tabela
        const [addL] = await connection.query(
            `INSERT INTO Reserva (fk_id_cliente, fk_id_local_premium, data_reserva, horario_inicio, horario_fim, preco_total) VALUES (?, ?, ?, ?, ?, ?)`,
            [fk_id_cliente, id_local_premium, data_reserva, horario_inicio, horario_fim, precoTotalFloat]
        );

        
     

        req.flash('success_msg', 'Reserva feita com sucesso!');
        res.redirect('/produto-confirmado');
    } catch (error) {
        req.flash('error_msg', 'Erro ao adicionar produto: ' + error.message);
        console.log(error);
        res.redirect('/add-product');
    }
};

const pegarReservas = async (req, res) => {

    const email = req.session.email;

    console.error("Email:", email);
    try {
        // 1. Busca o ID do cliente (usuário) baseado no email
        const [user] = await connection.query(
            `SELECT id FROM usuario_clientes WHERE email = ?`,
            [email]
        );

        console.log(user.length)

        // Verifica se o usuário foi encontrado
        if (user.length === 0) {
            console.log("por alguma porra de motivo não ta pegando o user")
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const fk_id_user = user[0].id;
        console.log(fk_id_user)


        const query = `
            SELECT r.id_reserva, r.fk_id_local_premium, r.data_reserva, r.horario_inicio, r.horario_fim, r.preco_total, 
                   i.nome_imagem,
                   l.nome_local_premium, l.id_local_premium,
                   u.nome AS nome_cliente, u.sobrenome AS sobrenome_cliente
            FROM Reserva r
            LEFT JOIN imagens i ON r.fk_id_local_premium = i.fk_local_premium_id
            LEFT JOIN usuario_clientes u ON r.fk_id_cliente = u.id
            LEFT JOIN local_premium l ON r.fk_id_local_premium = l.id_local_premium
            WHERE r.fk_id_cliente = ?
            GROUP BY r.id_reserva, i.nome_imagem, u.nome, u.sobrenome -- Agrupa os resultados para evitar duplicação
        `;
        const [results] = await connection.query(query, [fk_id_user]); // Filtra pelos favoritos

        // Formata os resultados para agrupar imagens por local
        const locais = results.reduce((acc, row) => {
            const { id_reserva, data_reserva, horario_inicio, horario_fim, nome_imagem, preco_total, id_local_premium, nome_local_premium, nome_cliente, sobrenome_cliente} = row;
            const location = acc.find(local => local.id_reserva === id_reserva);
            
            if (location) {
                if (nome_imagem) {
                    location.imagens.push(nome_imagem); // Adiciona a imagem se já existir o produto
                }
            } else {
                acc.push({
                    id_reserva, 
                    data_reserva, 
                    horario_inicio,
                    horario_fim,
                    preco_total, 
                    id_local_premium, 
                    nome_local_premium, 
                    nome_cliente, 
                    sobrenome_cliente,
                    imagens: nome_imagem ? [nome_imagem] : [] // Inicia array de imagens   
                });
            }
            return acc;
        }, []);

        // // Ordena as imagens de cada produto de acordo com a ordem definida
         locais.forEach(location => {
             location.imagens.sort((a, b) => {
                 const ordemA = results.find(row => row.nome_imagem === a).ordem_img;
                 const ordemB = results.find(row => row.nome_imagem === b).ordem_img;
                 return ordemA - ordemB;
             });
         });
        

        res.json(locais);
    } catch (error) {
        console.error("Erro ao buscar locais do banco de dados:", error);
        res.status(500).send("Erro ao buscar locais");
    }
};

const pegarReservasEmpresa = async (req, res) => {

    const email = req.session.email;

    console.error("Email:", email);
    try {
        // 1. Busca o ID do cliente (usuário) baseado no email
        const [user] = await connection.query(`SELECT id FROM empresas WHERE email = ?`, [email]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const fk_id_emp = user[0].id;
        


        const query = `
            SELECT l.id_local_premium, l.nome_local_premium, l.preco_hora,
					r.id_reserva, r.data_reserva, r.horario_inicio, r.horario_fim, r.preco_total, 
                   i.nome_imagem,
                   u.nome AS nome_cliente, u.sobrenome AS sobrenome_cliente
            FROM local_premium l
            LEFT JOIN Reserva r ON r.fk_id_local_premium = l.id_local_premium
            LEFT JOIN imagens i ON r.fk_id_local_premium = i.fk_local_premium_id
            LEFT JOIN usuario_clientes u ON r.fk_id_cliente = u.id
            
            WHERE l.fk_id_empresa = ?
            GROUP BY l.id_local_premium, r.id_reserva, i.nome_imagem, u.nome, u.sobrenome -- Agrupa os resultados para evitar duplicação
        `;
        const [results] = await connection.query(query, [fk_id_emp]); // Filtra pelos favoritos

        // Formata os resultados para agrupar imagens por local
        const locais = results.reduce((acc, row) => {
            const { id_local_premium, nome_local_premium, preco_hora, id_reserva, data_reserva, horario_inicio, horario_fim, preco_total, nome_imagem, nome_cliente, sobrenome_cliente} = row;
            const location = acc.find(local => local.id_reserva === id_reserva);
            
            if (location) {
                if (nome_imagem) {
                    location.imagens.push(nome_imagem); // Adiciona a imagem se já existir o produto
                }
            } else {
                acc.push({
                    id_local_premium, 
                    nome_local_premium, 
                    preco_hora, 
                    id_reserva, 
                    data_reserva, 
                    horario_inicio, 
                    horario_fim, 
                    preco_total, 
                    nome_cliente, 
                    sobrenome_cliente,
                    imagens: nome_imagem ? [nome_imagem] : [] // Inicia array de imagens   
                });
            }
            return acc;
        }, []);

        // // Ordena as imagens de cada produto de acordo com a ordem definida
         locais.forEach(location => {
             location.imagens.sort((a, b) => {
                 const ordemA = results.find(row => row.nome_imagem === a).ordem_img;
                 const ordemB = results.find(row => row.nome_imagem === b).ordem_img;
                 return ordemA - ordemB;
             });
         });
        

        res.json(locais);
    } catch (error) {
        console.error("Erro ao buscar locais do banco de dados:", error);
        res.status(500).send("Erro ao buscar locais");
    }
};

module.exports = {
    getLocalReservaById, fazerReserva, reservaConfirmada, pegarReservas, pegarReservasEmpresa,
};
