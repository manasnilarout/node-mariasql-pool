/**
 *  Users class to be used by the server to fetch the users in database with and without pooling
 */

function Users(client, pool) {
  this.client = client;
  this.pool = pool;
}

// Function that executes select query using newly created db connection
Users.prototype.queryWithoutPool = function (req, res) {
  var that = this;
  this.client.query('SELECT * FROM users WHERE id = :id AND user_name = :name', {
    id: 1,
    name: 'Test user'
  }, function (err, rows) {
    that.client.end();
    if (err) {
      console.log('Error on query');
      console.log(err);
      res.json({ code: 100, status: 'Error in connecting database' });
      return;
    } else {
      console.log(rows);
      res.json(rows)
    }
  });
}

// Function that executes select query by using a pooling connection
Users.prototype.queryWithPool = function (req, res) {
  var that = this;
  // Acquiring a connection
  this.pool.acquire().then(function (client) {
    client.query('SELECT * FROM users WHERE id = :id AND user_name = :name', {
      id: 1,
      name: 'Test user'
    }, function (err, rows) {
      if (err) {
        console.log('Error on query');
        console.log(err);
        res.json({ code: 100, status: 'Error in connecting database' });
      } else {
        console.log(rows);
        res.json(rows);
      }
      that.pool.release(client);
    });
  }).catch(function (err) {
    console.log('Error on query');
    console.log(err);
    that.pool.release(client);
  })
}
module.exports = Users;