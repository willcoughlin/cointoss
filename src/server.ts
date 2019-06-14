import express from 'express';

enum PortNumber {
  Http = 8080
};

const app = express();

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.listen(PortNumber.Http, () => {
  console.log('Web server started on port ' + PortNumber.Http);
});