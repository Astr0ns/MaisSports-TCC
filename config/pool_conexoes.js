const mysql = require('mysql2');
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql.createPool({
    host: 'localhost', 
    user: 'root', 
    password: '',
    database: 'bd0xccqaqlwuq4dfea1n',
    port: 3306,
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
