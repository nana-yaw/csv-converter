const chokidar = require('chokidar');
const path = require('path');
const csv = require('fast-csv');
const mssql = require('mssql');

const { credentials, watchDirectory } = require('./config');

mssql
  .connect(credentials)
  .then(() => {
    console.log('DB Connected...');
    // Initialize watcher.
    const watcher = chokidar.watch(watchDirectory, 'file or dir', {
      ignored: /(^|[/\\])\../,
      persistent: true,
    });

    watcher.on('add', (filePath, stat) => {
      console.log('File added...');
      const extension = path.extname(filePath);

      if (extension === '.csv') {
        console.log('Ready to process...');

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
              console.log('File parsed and records inserted');
              console.log(result);
              return process.exit(0);
            });
          });
      } else {
        console.log('Invalid file type!\n\rNothing to do here!\n\r');
        console.log(stat);
        process.exit(1);
      }
    });
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });

