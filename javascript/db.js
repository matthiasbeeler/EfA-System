var mysql = require('mysql2');

exports.database = mysql.createConnection({
    connectionLimit: 50000,
    host: process.env.dbHost,
    user: process.env.dbUsername,
    password: process.env.dbPassword,
    database: "EfA",
    port: process.env.dbPort,
    insecureAuth: true
});