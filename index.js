import {config} from 'dotenv';

const express = require('express');
const app = express();
config();
const port = process.env.PORT;
const path = require('path');

app.use(express.static(path.join(`${__dirname}/public`)));

app.get('/',(req,res) => {
    res.sendFile('./public/index.html');  
})

app.listen(port,() => {
  console.log(`listening on http://localhost:${port}`)
})