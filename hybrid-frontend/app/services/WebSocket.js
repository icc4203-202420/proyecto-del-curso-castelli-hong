// src/services/WebSocket.js

const createCable = (authToken) => {
    const NGROK_URL = 'YOUR_NGROK_URL'; // Reemplaza con tu URL de ngrok
    const ws = new WebSocket(`ws://${NGROK_URL}/cable?token=${authToken}`);
  
    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };
  
    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
    };
  
    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
  
    return ws;
  };
  
  export const subscribeToFeed = (ws, onReceived) => {
    // Enviar un mensaje para suscribirse al canal FeedChannel
    const message = {
      command: 'subscribe',
      identifier: JSON.stringify({ channel: 'FeedChannel' }),
    };
  
    ws.onopen = () => {
      ws.send(JSON.stringify(message));
    };
  
    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
  
      // Ignora los mensajes de ping o cualquier otro mensaje no relevante
      if (response.type === "ping" || !response.message) return;
  
      // Pasa los datos recibidos al callback
      onReceived(response.message);
    };
  
    return {
      unsubscribe: () => {
        const unsubscribeMessage = {
          command: 'unsubscribe',
          identifier: JSON.stringify({ channel: 'FeedChannel' }),
        };
        ws.send(JSON.stringify(unsubscribeMessage));
        ws.close();
      },
    };
  };
  
  export default createCable;
  