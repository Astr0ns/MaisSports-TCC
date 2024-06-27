const mysql = require('mysql2');
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, conn) => {
    if (err) 
        console.error("Erro ao conectar ao SGBD:", err);
    else {
        console.log("Conectado ao SGBD!");
        conn.release();
    }
});

module.exports = pool.promise();
