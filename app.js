const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const flash = require("connect-flash");
const productRouter = require('./app/routes/productRouter');
const paymentRoutes = require('./app/routes/router');

//configurações do app
app.use(express.static("app/public"));

//configurações do EJS
app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

//configurações da sessão
app.use(session({
  secret: 'host-pass-98$3',
  resave: false,
  saveUninitialized:'true',
  cookie: {secure:false}
}))

// Rota de pagamento
app.use('/api/payments', paymentRoutes);


//flash

app.use(flash());

app.use((req, res, next) => {
  res.locals.error_msg = req.flash('error_msg');
  res.locals.success_msg = req.flash('success_msg');
  next();
});

app.use('/uploads', express.static('uploads'));



var router = require("./app/routes/router");
app.use("/", router);


app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}\nhttp://localhost:${port}`);
});


