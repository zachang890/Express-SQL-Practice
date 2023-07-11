import './App.css';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';

function App() {
  const [items, setItems] = useState([]);

  function addList(event) {
    event.preventDefault();
    var name = event.target.name.value;
    var price = event.target.price.value;
    var quantity = event.target.quantity.value;
    setItems([...items, {name: name, price: price, quantity: quantity}]);
    fetch('/api/insert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({name: name, price: price, quantity: quantity}),
    })
  }
  
  function removeList(name) {
    setItems(items.filter(item => item.name !== name));
    fetch('/api/delete/' + name, {
      method: 'DELETE'
    })
  }

  useEffect(() => {
    async function getList() {
      await fetch('/api/get')
        .then(res => res.json())
        .then(data => setItems(data));
    }

    getList();
  }, []);

  return (
    <div className="App">
      <div>
        <form onSubmit={addList}>
          <label for="name">Name:</label>
          <input type="text" id="name" name="name"></input>
          <label for="price">Price:</label>
          <input type="text" id="price" name="price"></input>
          <label for="quantity">Quantity:</label>
          <input type="text" id="quantity" name="quantity"></input>
          <input type="submit" value="Submit"></input>
        </form>
      </div>
      <h1>Shopping List</h1>
      <table>
        <tr>
          <th>Name</th>
          <th>Price</th>
          <th>Quantity</th>
        </tr>
        {items.map(item => (
          <tr>
            <td>{item.name}</td>
            <td>{item.price}</td>
            <td>{item.quantity}</td>
            <td><button onClick={() => removeList(item.name)}>Remove</button></td>
          </tr>
        ))}
      </table>
    </div>
  );
}

export default App;
