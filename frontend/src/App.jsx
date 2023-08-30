import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import './App.css'


const socket = socketIOClient('http://localhost:3001'); // Change URL accordingly

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('savedMessages', (receivedMessages) => {
      setMessages(receivedMessages);
    });
  }, []);

  return (
    <div className="App">
      <h1>Saved Messages</h1>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>
            {message.name} - {message.origin} - {message.destination}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
