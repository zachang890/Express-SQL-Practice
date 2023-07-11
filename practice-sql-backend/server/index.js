const express = require('express');
const mysql = require('mysql');
const redis = require('redis');

const app = express();
const port = 3001;

// Start the redis client
const redisClient = redis.createClient();
(async () => {
  redisClient.on("error", (error) => console.error(`Ups : ${error}`));
  await redisClient.connect();
})();

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'practice',
});

// Connect to the local MySQL database
connection.connect(err => {
  if (err) throw err;
  console.log('Connected to local MySQL database');
});

// Middleware to parse request bodies as JSON
app.use(express.json());

// Create a POST endpoint for adding items
app.post('/api/insert', (req, res) => {
  const { name, price, quantity } = req.body;

  // Insert the new row into the local MySQL database
  const query = `INSERT INTO react (name, price, quantity) VALUES (?, ?, ?)`;
  connection.query(query, [name, price, quantity], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error inserting item into local MySQL database');
    } else {
      res.status(200).send('Item inserted successfully into local MySQL database');
    }
  });
});

app.delete('/api/delete/:name', (req, res) => {
  const { name } = req.params;
  const query = `DELETE FROM react WHERE name = ?`;
  connection.query(query, [name], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting item from local MySQL database');
    } else {
      res.status(200).send('Item deleted successfully from local MySQL database');
    }
  });
});

app.get('/api/get', (req, res) => {
  const query = `SELECT * FROM react`;
  connection.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving items from local MySQL database');
    } else {
      console.log("Data received from the SQL");
      res.status(200).send(result);
    }
  });
});

// Unused by the frontend, just for purposes of testing redis
app.get('/api/get/:name', async (req, res) => {
  const { name } = req.params;

  // First attempt to retrieve data from the cache
  try {
    const cachedResult = await redisClient.get(name);
    if (cachedResult) {
      console.log('Data received from the cache');
      res.status(200).send(cachedResult);
      return;
    }
  } catch (error) {
    console.error('Could not retrieve cached entry from Redis', error);
  }

  // Resort to SQL database if not found in cache
  const query = `SELECT * FROM react WHERE name = ?`;
  connection.query(query, [name], async (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving item from local MySQL database');
    } else {
      console.log("Data received from the SQL");
      res.status(200).send(result);

      // Cache the result for 10 seconds
      try {
        await redisClient.set(name, JSON.stringify(result), { EX: 10 });
      } catch (error) {
        console.error('Error storing the result in Redis', error);
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
