const express = require('express');
const app = express();
const port = 4551;
const path = require('path');

app.use(express.static(path.join(`${__dirname}/public`)));

app.get('/',(req,res) => {
    res.sendFile('./public/index.html');  
})

app.listen(port,() => {
  console.log(`listening on http://localhost:${port}`)
})