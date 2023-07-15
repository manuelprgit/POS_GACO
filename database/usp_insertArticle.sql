alter proc usp_insertArticle
--usp_insertArticle '10',1
--select referencia,* from mercan
	@barcode nvarchar(150),
	@quantity int
as
declare @articleId int;
declare @cat_itbis int;
declare @existen int;

set @articleId = ( select codigo from mercan where REFERENCIA = @barcode );
set @cat_itbis = ( select CAT_ITBIS from mercan where REFERENCIA = @barcode );
set @existen = ( select cantidad from EXISTEN where CODIGO = @articleId);

UPDATE EXISTEN 
    SET CANTIDAD = @existen - @quantity
    WHERE CODIGO = @articleId
    AND ALMACEN = 1;

	
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
     @articleId
    ,'FT'
    ,'S'
    ,PAPELERIA_GACO.dbo.fn_SqlToC(GETDATE())
    ,123456
    ,@quantity
    ,0
    ,(select precio from mercan where REFERENCIA = @barcode) PRECIO
    ,(select COSTO_PROM from mercan where REFERENCIA = @barcode) COSTO_PROM
    ,1
    ,''
    ,(select CLASE from mercan where REFERENCIA = @barcode) CLASE
    ,@quantity - (select precio from mercan where REFERENCIA = @barcode)
    ,0
    ,@quantity
    ,null
    ,@existen
    ,@existen - @quantity
    ,()
    ,'${param.article.REFERENCIA}'
    ,'Insertado caja PRUEBA'
)
 