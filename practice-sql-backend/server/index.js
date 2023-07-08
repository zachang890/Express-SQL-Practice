const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3001;

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
      res.status(200).send(result);
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
