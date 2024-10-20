const express = require('express');
const router = express.Router();
const { MercadoPagoConfig, Preference } = require('mercadopago'); // Import Preference

// Inicialize o cliente Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: 'TEST-5246075068010463-102011-23539c46def1acb4b061770a6d174e1e-428968371',
    options: { timeout: 5000, idempotencyKey: 'abc' }
});

const createPayment = async (req, res) => {
    const { titulo_prod, descricao_prod, valor_prod, categoria_prod, tipo_prod, roupa_prod, link_prod } = req.body;
    const email = req.session.email;
    console.log(req.files);

    // Verifica se existem arquivos enviados (imagens)
    if (req.files && req.files.length > 0) {
        const imagens = req.files.map(file => file.filename); // Obtem os nomes dos arquivos de imagem
    }

    req.session.produtoTemp = {
        titulo_prod,
        descricao_prod,
        valor_prod,
        categoria_prod,
        tipo_prod,
        roupa_prod,
        link_prod,
        imagens
    };

    try {
        // Inicialize o objeto de pagamento
        const preference = new Preference(client);

        // Crie o corpo da requisição de pagamento com dados vindos do cliente (ex: frontend)
        const body = {
            items: [
                {
                    id: '1234',
                    title: 'Dummy Title',
                    description: 'Dummy description',
                    picture_url: 'http://www.myapp.com/myimage.jpg',
                    category_id: 'car_electronics',
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: 10,
                }
                
            ],
            back_urls: {
                success: `https://fuzzy-computing-machine-g47rjr6rr7qxfp6r-3000.app.github.dev/adicionar-produto-confirmado`, // URL para sucesso
                failure: `https://fuzzy-computing-machine-g47rjr6rr7qxfp6r-3000.app.github.dev/adicionar-produto-falha`, // URL para falha
                pending: `https://fuzzy-computing-machine-g47rjr6rr7qxfp6r-3000.app.github.dev/adicionar-produto-pendente`, // URL para pendente
            },
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

module.exports = {
    createPayment,
};
