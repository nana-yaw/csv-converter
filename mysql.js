var mysql = require('mysql');
const credentials = require('./credentials.js');
var connection = mysql.createConnection({
    host: credentials.host,
    user: credentials.user,
    password: credentials.password,
    database: credentials.database
});

//Establish MySQL connection
connection.connect(function (err) {
    if (err)
        throw err
    else {
        console.log('Connected to MySQL');
    }
});

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
});

connection.end();