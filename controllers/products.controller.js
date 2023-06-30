import { query } from 'mssql';
import { getConnection } from '../database/conection.js'

const getFormattedDate = (date) => {

  date = new Date(date); 

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  
}

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

    postGetArticle(paramsRequerid);
    res.json(product.recordset[0]);

}

const getProductByBarCode = async (req, res) => {
 
    getParamsRequired(req.body);

}

const postInvoice = async (req, res) => {

    let result = req.body;
    console.log(result);

}

const createInvoice = async () => {

    let lastNumber;

    let pool = await getConnection();
    lastNumber = await pool
                            .request()
                            .query(`
                                select max(NUMERO) NUMERO from facturas;
                            `);
    let nextNumber = Number(lastNumber.recordset[0].NUMERO) + 1;
    pool.request().query(`insert into facturas (numero) values (${nextNumber})`);
    return nextNumber;
}

const getParamsRequired = async (params) => {
  
    let nextNumber = await createInvoice();
    let article = await getArticleById(params.barCode);
    article = article.recordset[0]; 
    let cat_itbis = await getCatItbis(article.CAT_ITBIS);
    cat_itbis = cat_itbis.recordset[0];
    let existen = await getExisten(article.CODIGO);
    existen = existen.recordset[0];

    let paramsRequired = {
        nextNumber,
        params,
        article,
        cat_itbis,
        existen
    }

    console.log({article,cat_itbis,existen}) 

    subtractExisten(paramsRequired);

    insertMovimi(paramsRequired);

    updateLastSold(getFormattedDate(new Date()),nextNumber,article.CODIGO)

}

const getArticleById = async (barCode) => {
    
    let pool = await getConnection(); 
    return await pool
                .request()
                .query(`
                    select * from mercan
                    where referencia = '${barCode}'
                    `);         
}
const getCatItbis = async (cat_itbis) => {
 
    let pool = await getConnection();
    return await pool
                .request()
                .query(`
                        select * from CAT_ITBIS
                        where numero = ${cat_itbis}
                `); 
}
const getExisten = async (articleId) => {
  let pool = await getConnection();
  return await pool
               .request()
               .query(`
                select * from existen
                where codigo = ${articleId}
               `);
}

const subtractExisten = async (param) => {
  let pool = await getConnection();

  let cantidad = param.existen.CANTIDAD - param.params.quantity;

  pool.request().query(`
    UPDATE EXISTEN 
    SET CANTIDAD = ${cantidad}
    WHERE CODIGO = ${param.article.CODIGO}
    AND ALMACEN = 1
  `)
}

const insertMovimi = async (param) => {
    
  let pool = await getConnection();
  pool
  .request()
  .query(`
        insert into PAPELERIA_GACO.dbo.MOVIMI
        (
             CODIGO      --codigo del articulo
            ,TIPO        --FT creo que es factura
            ,E_S		 --E = Entrada, S = Salida
            ,FECHA		 --Fecha
            ,DOCUMENTO   --El documento es la factura
            ,CANTIDAD1   --La cantidad que ENTRO
            ,CANTIDAD2   --La cantidad que SALIO
            ,PRECIO      --Precio
            ,COSTO       --costo_prom
            ,ALMACEN     --Almacen
            ,SUCURSAL    --''
            ,CUENTA      --Clase
            ,SUBTOTAL	 --CANTIDAD * PRECIO
            ,CLIENTE	 --CLIENTE
            ,CANTIDAD	 --Cantidad
            ,FECHA_DOC   --null
            ,EXIST_ANT   --cantidad que traemos al darle select a existen
            ,EXIST_POST	 --cantidad que se resta O se suma a la existencia anterior
            ,HORA		 --hora en la que se hizo el movimiento
            ,REFERENCIA	 --codigo de babrra
            ,DETALLE	 --E: Borrado Caja Papeleria , S: Caja Papeleria
        ) 
            VALUES
        (
             ${param.article.CODIGO}
            ,'FT'
            ,'S'
            ,PAPELERIA_GACO.dbo.fn_SqlToC('${new Date().toISOString().substring(0,10)}')
            ,${param.nextNumber}
            ,${param.params.quantity}
            ,0
            ,${param.article.PRECIO}
            ,${param.article.COSTO_PROM}
            ,1
            ,''
            ,${param.article.CLASE}
            ,${param.params.quantity * param.article.PRECIO}
            ,0
            ,${param.params.quantity}
            ,null
            ,${param.existen.CANTIDAD}
            ,${param.existen.CANTIDAD - param.params.quantity}
            ,'${getFormattedDate(new Date()).substring(11,19)}'
            ,'${param.article.REFERENCIA}'
            ,'Insertado caja PRUEBA'
        )
  `)
}

const updateLastSold = async (date, number,articleId) => {
    console.log({date,number,articleId})
    console.log(new Date().toISOString().substring(0,10))
    let pool = await getConnection();
    await pool.request().query(`
            UPDATE DBO.MERCAN 
            SET FECHA_U_V = PAPELERIA_GACO.dbo.fn_SqlToC('${new Date().toISOString().substring(0,10)}')
            ,DOC_U_V   = ${number}
            WHERE CODIGO = ${articleId}`
        )
  
}

const insertAuditor = async () => {
  
}

export {
    getProducts,
    postInvoice,
    getProductById,
    getProductByBarCode
}