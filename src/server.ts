import express from 'express';
import path from 'path';
import { createServer } from 'http';
import GameServer from './GameServer';

const STATIC_DIR = path.join(__dirname, 'static');
const PORT_NUM = 8080;

/* 
 * set up http server
 */
  
const app = express();
app.use(express.static(STATIC_DIR));

// handle all requests by serving our html page
app.get('/*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

const http = createServer(app);
http.listen(PORT_NUM, () => {
  console.log('Server started on port ' + PORT_NUM);
});

/* 
 * set up socket server 
 */

new GameServer(http).start();