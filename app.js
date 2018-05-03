//1. Watch directory containing .csv files

//2. If the directory is not empty and the file type is ".csv" and not empty

//3. The name of the non-empty file should not match the name as the last file processed

//4. If the above validations are passed.

//5.If the extraction is successful,  data extracted is inserted to a database.

//6. The name of the file is saved or cached.

//7. The file is then deleted.

var fs = require('fs');

var chokidar = require('chokidar');

const credentials = require('./credentials.js');

var dirToWatch = './final/';

var fileName;

// Initialize watcher.
var watcher = chokidar.watch(dirToWatch,'file or dir', {
    ignored: /(^|[\/\\])\../,
    persistent: true
});

// Something to use when events are received.
var log = console.log.bind(console);

log("\n\n\rService has started\n\n\r");

watcher
    .on('add', function (path,stat) { 
       
        var directory = require('path');
        
        var extension = directory.extname(path);

        fileName = directory.basename(path);

        log('File: ', fileName, 'has been added');
        
        // log(extension);

        // log(fileName);
        
        if (extension === '.csv') {
                
            log('Ready to process!');
            // log(stat);

            var csv = require('fast-csv');

            let allCsvData = [];

            let csvStream = csv.fromPath(path, { 
                headers: true,
                ignoreEmpty:true 
            })
                .on("data", function (record) {

                    if (record !== null && record !== " ") {
                        
                        // log("Current CSV Data: ",record);

                        let sell = record.Sell;
                        let list = record.List;
                        let living = record.Living;
                        let rooms = record.Rooms;
                        let beds = record.Beds;
                        let baths = record.Baths;
                        let age = record.Age;
                        let acres = record.Acres;
                        let taxes = record.Taxes;

                        var csvData = [sell, list, living, rooms, beds, baths, age, acres, taxes];

                        allCsvData.push(csvData);

                    } else{
                        
                        log(fileName,' is an empty file!\n\r');

                    }

                }).on("end", function () {

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
                            log('Connection is up!');
                        }
                    });

                    var sql = "INSERT INTO records (sell, list, living, rooms, beds, baths, age, acres, taxes) VALUES ?";

                    // console.time("Query Execution Time");
                    connection.query(sql, [allCsvData], function (error, results) {
                        if (error) throw error;
                        // console.timeEnd("Query Execution Time");
                        log("Number of records inserted: " + results.affectedRows);
                        log("Data saved!");
                    
                    });

                        connection.end();

                    fs.unlink(path,function() {
                        
                    });

                }).on("error", function (err) {
                    log(err);
                });
           
        } else {
               
            log('Invalid file type!\n\rNothing to do here!\n\r');
            log(stat);
            
           
        } //end of if/else

    })
    .on('change', function (path) { log('File', path, 'has been changed'); })
    .on('unlink', function (path) { 
        log('File: ', fileName, ' was removed after data was inserted into the database!\n\r');
        
    })
    .on('error', function (error) { console.error('An error occured: ', error,'\n\r'); })

    
    
