const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(JSON.stringify({message:'Ciao da Node.js!', status: 'success', timestamp: new Date()}));
});

server.listen(3000, () => {
  console.log('Server su http://localhost:3000');
});
