import { getConnection } from '../database/conection.js'

const getProducts = async (req, res) => {

    let pool = await getConnection();
    let result = await pool.request().query('select * from mercan');

    res.json(result.recordset);
}

const getProductById = async (req, res) => {

    const { barcode } = req.params;
    let pool = await getConnection();

    let product = await pool.request().query(`select * from mercan where referencia = '${barcode}'`);
    let catItbis = await pool.request().query(`select cat_itbis from mercan where referencia = '${barcode}'`);
    
    if (product.recordset.length <= 0) {
        return res.status(400).json({ msg: 'Articulo no encontrado' });
    }

    let paramsRequerid = {
        product: product.recordset[0],
        catItbis: catItbis.recordset[0]
    }

    insertArticle(paramsRequerid);
    res.json(product.recordset[0]);

}

const getProductByBarCode = async(req, res) => {
  
    let pool = await getConnection();
    console.log(req.params)

}

const postInvoice = async (req, res) => {

    let result = req.body;
    console.log(result);

}

const insertArticle = (paramsRequerid) => {

    console.log(paramsRequerid)

}

export {
    getProducts,
    postInvoice,
    getProductById,
    getProductByBarCode
}