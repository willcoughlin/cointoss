import express from 'express';
import path from 'path';

const STATIC_DIR = path.join(__dirname, 'static');

enum PortNumber {
  Http = 8080
};

const app = express();
app.use(express.static(STATIC_DIR));

app.get('/*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PortNumber.Http, () => {
  console.log('Web server started on port ' + PortNumber.Http);
});