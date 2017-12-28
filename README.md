node-mariasql-pool
========================
A demo app that demonstrates the benefits of using pooling using node-mariasql in Node.js. Using this app,
you can depict performance impact on each request that you will make to server using [generic-pool](https://github.com/coopernurse/node-pool).
# Dependencies
- node.js (must be of version>= 8.4.0).
- npm (must be of version>= 5.3.0).


# How to run

## Get the files from gitlab
- Do a git clone - git clone [https://github.com/OsmosysSoftware/node-mariasql-pool.git](https://github.com/OsmosysSoftware/node-mariasql-pool.git)

## Setup the SQL database

We use the MariaDB server.

1. Set the variables which are there in maria-sql client object in `server.js` file to point to your database.
2. Run the queries in `sql/testdb.sql` file to restore the database that is needed to test this example.

## Installing dependencies
```
# To install node.js dependencies
npm install
```

## Run the server
```
# To run the server that will create database connections without pooling
## Use default database configuration
node server.js 
## Use arguments as database configuration
node server.js -host HOST_NAME -user USER_NAME -pwd PASSWORD -db DATAABASE 

# To run the server that will create database connections with pooling using generic-pool
## Use default database configuration
node server.js -pool
## Use arguments as database configuration
node server.js -host HOST_NAME -user USER_NAME -pwd PASSWORD -db DATAABASE -pool 
```
# Make a request

Make a GET request [http://localhost:3000/users](http://localhost:3000/users)

# Performance test
1. Download [Jmeter](http://www-us.apache.org/dist//jmeter/binaries/apache-jmeter-3.3.tgz).
2. Run `sh bin/jmeter.sh` to get GUI mode for load testing.
3. Open the testplan `/load-tests/PerformanceTestPlanMemoryThread.jmx` in Jmeter.
4. Run the load test taking 100 threads i.e 100 concurrent request.

For more information you can visit our blog [here](http://10.0.0.155/books/faq-nodejs/page/how-to-use-mariasql-driver-with-generic-pool)
