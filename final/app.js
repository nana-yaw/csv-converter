//1. Watch directory containing .csv files

//2. If the directory is not empty and the file type is ".csv" and not empty

//3. The name of the non-empty file should not match the name as the last file processed

//4. If the above validations are passed, the file is converted into JSON.

//5.If the conversion is successful, JSON data is inserted to a database.

//6. The name of the file is saved or cached.

//7. The file is then deleted.

var fs = require('fs');

var chokidar = require('chokidar');

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

            //require the csvtojson converter class 
            var Converter = require("csvtojson").Converter;

            // create a new converter object
            var converter = new Converter({});

            // csv file as well as a callback function
            converter.fromFile(path, function (err, result) { 
                // if an error has occured then handle it
                if (err) {
                    
                    log("An Error Has Occured");
                    
                    log(err);

                } else{
                    
                    // create a variable called json and store
                    // the result of the conversion
                    var json = result;

                    // log our json to verify it has worked
                    log(json);

                    //Logic to add json data to database

                    //Deleting the CSV File after conversion
                    fs.unlink(path, function (err) {
                        if (err){
                            throw err;
                            log(err);
                        }else {
                            log('The file(' + fileName + ') deleted successfully!');
                        }
                    }); //end of delete function
                }
                
            });
           
        } else {
               
            log('Invalid file type!\n\rNothing to do here!');
            log(stat);
           
        } //end of if/else

    })
    //.on('change', function (path) { console.log('File', path, 'has been changed'); })
    .on('unlink', function (path) { console.log('File: ', path, ' has been removed'); })
    //.on('error', function (error) { console.error('Error happened', error); })
