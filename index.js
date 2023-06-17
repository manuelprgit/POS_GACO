import {config} from 'dotenv';
const express = require('express');
const app = express();
config();
const port = process.env.PORT;
const path = require('path');

import productsRouts from './routes/products.routes';
import userRouts from './routes/user.routes';

app.use(express.static(path.join(`${__dirname}/public`)));

app.get('/',(req,res) => {
    res.sendFile('./public/index.html');
})

//Cuando cree en router tengo que usarlo aqui

//middlewares
app.use(express.json()); //resivir formato JSON
app.use(express.urlencoded({extended:false})); // resivir formato desde formularios HTML
app.use(productsRouts);
app.use(userRouts);

app.listen(port,() => {
  console.log(`listening on http://localhost:${port}`)
})