const axios = require('axios');
const fs = require('fs');

const apiKey = 'AIzaSyAWbt8swMuBYCFDkTf_ok9fh9ZXmKvqRr8'; // API Key real del usuario
const fileData = fs.readFileSync('cliente_100006690.txt', 'utf8');

axios.post(
  `https://generativelanguage.googleapis.com/v1beta/files?key=${apiKey}`,
  fileData,
  { headers: { 'Content-Type': 'text/plain' } }
).then(res => {
  console.log('Respuesta de Gemini Files API:', res.data);
}).catch(err => {
  if (err.response) {
    console.error('Error de Gemini Files API:', err.response.data);
  } else {
    console.error('Error de red o configuración:', err.message);
  }
}); 