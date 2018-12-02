const mysql = require('mysql');

const connection = mysql.createConnection({
    host : 'localhost',
    port : '3306',
    user : 'root',
    password : 'password',
    database : 'db'
});

connection.connect(function(err) {
    if (err) console.log("Not");
    console.log("Connected!");
  });