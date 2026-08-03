require("dotenv").config(); // 1) carrega o .env ANTES de tudo
console.log('MP Token carregado:', process.env.MP_ACCESS_TOKEN?.slice(0, 15));
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const flash = require("connect-flash");

const productRouter = require('./app/routes/productRouter');
const router = require("./app/routes/router");
// const paymentRouter = require('./app/routes/paymentRouter'); // 6) criar um arquivo dedicado

app.use(express.static("app/public"));
app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET, // 3) nunca hardcoded
  resave: false,
  saveUninitialized: false, // 'true' como string era bug também
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 2 // 2h, ajuste como quiser
  }
}));

app.use(flash());
app.use((req, res, next) => {
  res.locals.error_msg = req.flash('error_msg');
  res.locals.success_msg = req.flash('success_msg');
  next();
});

app.use('/uploads', express.static('uploads'));

// app.use('/api/payments', paymentRouter); // 6) usar router dedicado quando existir
app.use('/produtos', productRouter); // 7) agora sendo usado de fato
app.use("/", router);

// 8) 404
app.use((req, res) => {
  res.status(404).render('404'); // ou res.status(404).send('Não encontrado')
});

// 8) erro genérico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado no servidor.');
});

app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}\nhttp://localhost:${port}`);
});