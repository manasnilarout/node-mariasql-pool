/**
 *  A sample server to show the performance impact for a request with pooling and without pooling
 */

const express = require('express');
const Client = require('mariasql');
const poolModule = require('generic-pool');

let Users = require('./users')

let app = express();
let client = new Client();
let pool = {};
let isPoolTesting = false;

// main
function main() {
  let args = process.argv;
  if (args.length > 2 && args[args.length - 1] === '-p') {
    isPoolTesting = true;
    handlePoolConnection();
  } else {
    handleNormalConnection();
  }
}

/**
 * Function that will create connection to MariaDB database by creating pool connenctions.
 * This is called when server.js is called by passing -p argument and command to run is node server.js -p
 **/
function handleNormalConnection() {
  // Connecting to database
  client.connect({
    host: '10.0.0.66',
    user: 'osmosys',
    password: 'osmlinuxdev@123',
    db: 'test_db'
  });

  client.on('error', function (err) {
    console.log('Client error: ' + err);
  }).on('ready', function (hadError) {
    console.log('Client is ready');
  });
}

function handlePoolConnection() {
  // Creating a pool
  pool = poolModule.createPool({
    create: function (callback) {
      return new Promise(function (resolve, reject) {
        client.connect({
          host: '10.0.0.66',
          user: 'osmosys',
          password: 'osmlinuxdev@123',
          db: 'test_db'
        });
        client.on('error', function (err) {
          console.log('Client error: ' + err);
          reject(err);
        }).on('ready', function (hadError) {
          resolve(client)
        });
      })
    },
    destroy: function (client) {
      return new Promise(function (resolve, reject) {
        client.end();
        resolve();
      })
    }
  },{
    max: 100,
    min: 10, // Connections limit,
    idleTimeoutMillis: 30000
  });
}

app.get('/users', function (req, res) {
  let usersObj = new Users(client, pool);
  // Executing the query with and without pool
  if (isPoolTesting) {
    usersObj.queryWithPool(req, res);
  } else {
    usersObj.queryWithoutPool(req, res);
  }
});

app.listen(3000);
console.log('Express is Listening..');
// Running the main function
main();

// When an exception occurs release all the pooling connections before starting your server
process.on('uncaughtException', function (err) {
  console.log('FIRED');
  pool.drain().then(function() {
      return pool.clear();
  });
});
