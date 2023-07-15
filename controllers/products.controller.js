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

    subtractExisten(paramsRequired);

    insertMovimi(paramsRequired);

    updateLastSold(getFormattedDate(new Date()),nextNumber,article.CODIGO);

    insertAuditor(paramsRequired);

    upadteOrdenFfactura(paramsRequired);

    let subGrupo = await getSubGrupo(paramsRequired);
    
    let clase = await getClase(paramsRequired);

    let suplidor = await getSuplior(paramsRequired);

    paramsRequired = {...paramsRequired
                     ,...subGrupo
                     ,...clase
                     ,...suplidor
                    }

    console.log(paramsRequired)
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
    
    let pool = await getConnection();
    await pool.request().query(`
            UPDATE DBO.MERCAN 
            SET FECHA_U_V = PAPELERIA_GACO.dbo.fn_SqlToC('${new Date().toISOString().substring(0,10)}')
            ,DOC_U_V   = ${number}
            WHERE CODIGO = ${articleId}`
        )
  
}

const insertAuditor = async (param) => {
  let pool = await getConnection();

  try {
      
    await pool.request().query(`
    INSERT INTO AUDITOR 
    (
         ORDEN			--0
        ,HORA			--HORA
        ,FECHA			--FECHA
        ,ACCION			--0 = Creacion de factura, 1 = Insercion de articulo, 3 = remover articulo
        ,COMENTARIO     --Codigo 9(Codigo del articulo) Cant. 1 No. 3903780 (Numero del documento)
        ,COMENTARIO2	--nada
        ,TIPO_DOC		--FT
        ,USUARIO		--Cajera
        ,NIVEL			--1
        ,MODULO			--Factura
    ) VALUES 
    (
         0
        ,dbo.fnSqlToClarion('${getFormattedDate(new Date()).substring(11,18)}')
        ,dbo.fnSqlToClarion('${new Date().toISOString().substring(0,10)}')
        ,1
        ,'Codigo ${param.article.CODIGO} Cantidad ${param.params.quantity} No. ${param.nextNumber}'
        ,''
        ,'PR' 
        ,'Cajero temporal' --TODO: Traer el cajero del login
        ,1      --TODO: traer nivel del cajero desde el login
        ,'Proforma'
    )
    `)
        
  } catch (error) {
    return({
        msg: 'Error al insertar en tabla AUDITOR',
        error: error
    })
  }
}

const upadteOrdenFfactura = async(param) => {
    let pool = await getConnection();
    pool.request().query(`
        UPDATE dbo.facturas 
        SET ORDEN =  1 --TODO: ver de donde sacamos orden
        WHERE NUMERO = ${param.nextNumber}
    `)  
}

const getSubGrupo = async(param) => {
    let pool = await getConnection();

    try {
        let {recordset} = await pool.request().query(`
            select 
                 CODIGO 
                ,GRUPO 
                ,DESCRIPCION 
            from Subgrupo 
            where CODIGO = ${param.article.SUB_GRUPO} --SUB_GRUPO del articulo
            and GRUPO = 1 --TODO: no se donde encontrar el grupo
        `);

        return (recordset.length > 0) ? recordset : 0;

    } catch (error) {
        return({
            msg: 'Error al traer el subgrupo',
            error: error
        })
    } 
    
}

const getClase = async(param) => {
    let pool = await getConnection();

    try {
        let {recordset} = await pool.request().query(`
            select 
                 CODIGO
                ,DESCRIPCION
                ,CUENTA
                ,DC_ING
                ,CTA_COSTO
                ,DC_COS
                ,CTA_DEVOLU
                ,DC_DEV 
            from clases
            where codigo = ${param.article.CLASE}
        `); 

        return (recordset.length > 0) ? recordset : 0;

    } catch (error) {
        return({
            msg: 'Error al traer la clase',
            error: error
        })
    } 
    
}

const getSuplior = async(param) => {
    let pool = await getConnection();

    try {
        let {recordset} = await pool.request().query(`
            select * from papeleria_gaco.dbo.CXP_01
            where codigo = ${param.article.SUPLIDOR}
        `); 
        return (recordset.length > 0) ? recordset : 0
        
    } catch (error) {
        return({
            msg: 'Error al traer el suplidor',
            error: error
        })
    }

}

const insertIntD_Fatcs = async(param) => {
    let pool = await getConnection();

    pool.request().query(`
    INSERT INTO D_FACTS 
    (
         NUMERO			--numero de la factura
        ,MERCANCIA		--codigo pequeño del articulo
        ,MOVIMIENTO		--0
        ,CANTIDAD		--Cantidad
        ,PRECIO			--Precio
        ,DESCUENTO		--Descuento
        ,DESCUENTO2		--Descuento 2
        ,COSTO			--costo_prom
        ,SALDO_CANT		--0
        ,SALDO_VALOR	--0
        ,ALMACEN		--1
        ,ITBIS			--subtotal * 0.152542
        ,BAND_ITBIS		--S: si lleva itbis, N: si no lleva itbis
        ,SUBTOTAL		--cantidad * precio
        ,TIPO			--0
        ,OFERTA			--0
        ,COMISION		--categoria de itbis del articulo
        ,VENDEDOR		--0
        ,FECHA			--fechaa
        ,LADO			--sucursal que podria ser el 4
        ,SERVICIO       --""
        ,REFERENCIA		--codigo de barra
        ,ORDEN			--TODO: PREGUNTAR QUE ES EL ORDEN
        ,SECUENCIA		--TODO: PREGUNTAR QUE ES LA SECUENCIA
        ,DESCRIPCION	--Descripcion del articulo
        ,EXENTAS		--BAND_ITBIS != 'S' ? EXENTAS = SUBTOTAL : EXENTAS = 0
        ,GRAVADAS		--BAND_ITBIS == 'S' ? GRAVADAS = SUBTOTAL : GRAVADAS = 0
        ,FAMILIA		--CLASES DE MERCAN
        ,N_FAMILIA		--EN LA TABLA CLASES PODEMOS ENCONTRAR LA DESCRIPCION.
        ,DPTO			--DPTO DE MERCAN
        ,N_DPTO			--EN LA TABLA INV_DEP PODEMOS ENCONTRAR LA DESCRIPCION.
        ,SUBDPTO		--TODO: DE DONDE SACO SUB DEPTARTAMENTO
        ,N_SUBDPTO		--TODO: DE DONDE SACO NOMBRE SUB DEPTARTAMENTO
        ,SUPLIDOR		--EN MERCAN HAY UNA COLUMNA CON EL CODIGO DEL SUPLIDOR
        ,DPTO_SUP		--TODO: ""
        ,N_DEP_SUP		--TODO: ""
        ,FABRICA		--TODO: ""
        ,N_FABRICA		--TODO: ""
        ,MARCA			--TODO: "" 
        ,N_MARCA		--TODO: ""
        ,UBICA			--TODO: ""
        ,N_UBICA		--TODO: ""
        ,PRECIO2		--TABLA DE MERCAN
        ,PRECIO3		--TABLA DE MERCAN
        ,PRECIO4		--TABLA DE MERCAN
        ,COSTO_PROM		--TABLA DE MERCAN
        ,ULT_COSTO		--TABLA DE MERCAN
        ,POR_ITBIS		--TABLA DE CAT_ITBIS
        ,REBAJADO		--TODO: 1
        ,FECHA_DIA		--Fecha convertida en Date
        ,HORA_DIA		--Hora convertida en Date
        ,MI_PC			--Nombre de la caja
        ,INSTANCIA		--Nombre de la caja
        ,USUARIO		--Ususario del login
        ,TIENDA			--Sucursal
    ) VALUES 
    (

    )
    `)
  
}

export {
    getProducts,
    postInvoice,
    getProductById,
    getProductByBarCode
}