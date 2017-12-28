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
let clientObj = {
  host: '10.0.0.66',
  user: 'osmosys',
  password: 'osmlinuxdev@123',
  db: 'test_db'
}

// main
function main() {
  let isAgrsPassed = getArgumets();
  if (!isAgrsPassed) {
    console.log('Invalid arguments passed.');
    process.exit(9);
  }
  if (isPoolTesting) {
    console.log(`Creating pool connection with database configuration as ${JSON.stringify(clientObj)}`);
    handlePoolConnection();
  } else {
    console.log(`Creating normal connection with database configuration as ${JSON.stringify(clientObj)}`);
    handleNormalConnection();
  }
}

// Process the arguments
function getArgumets() {
  let args = process.argv;
  if (args.length <= 2) {
    return true;
  }
  let processedArgs = {};
  for (let i = 2; i < args.length; i = i + 2) {
    if (!args[i] || (!args[i + 1] && args[i] !== '-pool')) {
      return false;
    }
    if (args[i] === '-host') {
      clientObj.host = args[i + 1];
    } else if (args[i] === '-usr') {
      client.user = args[i + 1];
    } else if (args[i] === '-pwd') {
      clientObj.password = args[i + 1];
    } else if (args[i] === '-db') {
      clientObj.db = args[i + 1];
    } else if (args[i] === '-pool') {
      isPoolTesting = true
    }
  }
  return true;
}

/**
 * Function that will create connection to MariaDB database by creating pool connenctions.
 * This is called when server.js is called by passing -p argument and command to run is node server.js -p
 **/
function handleNormalConnection() {
  // Connecting to database
  client.connect(clientObj);

  client.on('error', function (err) {
    console.log('Client error: ' + err);
  }).on('ready', function (hadError) {
    console.log('Client is ready');
  });
}

/**
 * Function that will create connection to MariaDB database by creating pool connenctions.
 * This is called when server.js is called by passing -p argument and command to run is node server.js -p
 **/
function handlePoolConnection() {
  // Creating a pool
  pool = poolModule.createPool({
    create: function (callback) {
      return new Promise(function (resolve, reject) {
        client.connect(clientObj);
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
    },
    validate: function (client) {
      return new Promise(function (resolve, reject) {
        if (client) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    }
  }, {
      max: 100, // Connections limit
      min: 10, // Connections to create
      idleTimeoutMillis: 30000, // Time for pool to sit idle
      testOnBorrow: true, // Validate the resource before giving to client
      evictionRunIntervalMillis: 5000 // Run eviction checks
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
  pool.drain().then(function () {
    return pool.clear();
  });
});
