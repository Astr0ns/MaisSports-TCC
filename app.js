const express = require("express");
const app = express();
const port = 3000;
const session = require("express-session");
const FileStore = require("session-file-store")(session)

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

var rotas = require("./app/routes/router");
app.use("/", rotas);


app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}\nhttp://localhost:${port}`);
});
