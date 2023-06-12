import { getConnection } from '../database/conection.js'

const getProducts = async (req,res) => {
   
    let pool = await getConnection();
    let result = await pool.request().query('select * from mercan where codigo = 7');
 
    res.json(result.recordset);
}

const getProductById = async (req,res) => {
    
    const {productId} = req.params;
    let pool = await getConnection();
    let product = await pool.request().query(`select * from mercan where referencia = '${productId}'`);
    res.json(product.recordset);

}

const postInvoice = async (req, res) => {

    let result = req.body;
    console.log(result);

}

export {
    getProducts,
    postInvoice,
    getProductById
}