var fs = require('fs');
const chokidar = require('chokidar');
const path = require('path');
const csv = require('fast-csv');
const mssql = require('mssql');

const { credentials, watchDirectory } = require('./config.js');

mssql
  .connect(credentials)
  .then(() => {
    console.log("The service has started...\n\n\r");
    console.log('DB Connected...\n\r');
    // Initialize watcher.
    const watcher = chokidar.watch(watchDirectory, 'file or dir', {
      ignored: /(^|[/\\])\../,
      persistent: true,
    });

    watcher.on('add', (filePath, stat) => {
        console.log('File added...\n\r');
      const extension = path.extname(filePath);

      if (extension === '.csv') {
          console.log('CSV file identified!\n\n Ready to process...\n\r');

        const allCSVData = [];

        csv.fromPath(filePath, {
          headers: true,
          ignoreEmpty: true,
          trim: true,
          objectMode: true,
        })
          .on('data', (record) => {
            // Insert each row as it is parsed
            if (record && record !== ' ') {
              // Gets values from object (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values)
              const csvData = Object.values(record);
              allCSVData.push(csvData);
            }
          })
          .on('end', () => {
            const valuesStrings = allCSVData.map(data => `(${data.join(',')})`);
            const sqlQuery = `
            INSERT into records (sell,list,living,rooms,beds,baths,age,acres,taxes) values
              ${valuesStrings.join(',\n')}
          `;
            const request = new mssql.Request();
            request.query(sqlQuery, (err, result) => {
              if (err) {
                console.error(err);
                return process.exit(1);
              }
              console.log('File parsed and records inserted!\n\rAffected rows: ',result.rowsAffected,'\n\n\r');
            //   console.log(result);
            //   return process.exit(0);
                fs.unlink(filePath, function () {
                    console.log(filePath, ' removed!\n\r');
                    console.log("The service is still running...\n\n\r");
                });
            });
          });
      } else {
        console.log('Unsupported file type!\n\rNothing to do here!\n\r');
        console.log(stat,'\n\n\r');
        console.log("The service is still running...");
        // process.exit(1);
      }
    });
  }).catch((err) => {
    console.error(err,'\n\n\r');
    console.log("The service will exit due to error!");
    process.exit(1);
  });

