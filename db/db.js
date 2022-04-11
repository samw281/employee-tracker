require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: process.env.db_user,
    password: process.env.db_pw,
    database: process.env.db_name
});

db.connect(err =>{if(err) throw err;});

module.exports = db;

