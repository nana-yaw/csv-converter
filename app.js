//1. Watch directory containing .csv files

//2. If the directory is not empty and the file type is ".csv" and not empty

//3. The name of the non-empty file should not match the name as the last file processed

//4. If the above validations are passed, the file is converted into JSON.

//5.If the conversion is successful, JSON data is inserted to a database.

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

watcher
    // .on('ready', () => log('Watch has began!\n\rInitial scan complete. Ready for changes'))
    .on('add', function (path,stat) { 
        
        log('File: ', path, 'has been added');
       
        var directory = require('path');
        
        var extension = directory.extname(path);

        fileName = directory.basename(path);
        
        log(extension);

        log(fileName);
        
        if (extension === '.csv') {
                
            log('Ready to process!');
            log(stat);

            var csv = require('fast-csv');

            let csvStream = csv.fromPath(path, { 
                headers: true,
                ignoreEmpty:true 
            })
                .on("data", function (record) {
                    //csvStream.pause();

                    if (csvStream !== null && csvStream !== []) {
                        
                        log(record);
            //             let policyID = record.policyID;
            //             let statecode = record.statecode;
            //             let county = record.county;
            //             let point_latitude = record.point_latitude;
            //             let point_longitude = record.point_longitude;
            //             let line = record.line;
            //             let construction = record.construction;

            //             pool.query("INSERT INTO FL_insurance_sample(policyID, statecode, county, point_latitude, point_longitude, line, construction) \
            // VALUES($1, $2, $3, $4, $5, $6, $7)", [policyID, statecode, county, point_latitude, point_longitude, line, construction], function (err) {
            //                     if (err) {
            //                         console.log(err);
            //                     }
            //                 });
                        
                    }else{
                        
                        log('File is empty!');

                    }

                    //csvStream.resume();

                }).on("end", function () {
                    log("Job is done!");
                }).on("error", function (err) {
                    log(err);
                });
           
        } else {
               
            log('Invalid file type!\n\rNothing to do here!');
            log(stat);
           
        } //end of if/else

    })
    //.on('change', function (path) { console.log('File', path, 'has been changed'); })
    .on('unlink', function (path) { console.log('File: ', path, ' has been removed'); })
    //.on('error', function (error) { console.error('Error happened', error); })
