
declare @article nvarchar(100);
declare @cat_itbis int
declare @cantidad int
declare @almacen int = 1;
-----------------PASO 1----------------
set @article = (select CODIGO from mercan where referencia = @article)
SELECT * FROM MERCAN where REFERENCIA = @article;

-----------------PASO 2----------------
set @cat_itbis = (select cat_itbis from mercan where referencia = '10')
select * from CAT_ITBIS where numero = @cat_itbis;

-----------------PASO 3----------------
select * from existen where CODIGO = @article and ALMACEN = @almacen 

-----------------PASO 4----------------
UPDATE DBO.EXISTEN SET CANTIDAD = @cantidad WHERE CODIGO = @article AND ALMACEN = @almacen

-----------------PASO 5----------------
insert into movimi
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
) VALUES 
(
 CODIGO      
,TIPO        
,E_S		 
,FECHA		 
,DOCUMENTO   
,CANTIDAD1   
,CANTIDAD2   
,PRECIO      
,COSTO       
,ALMACEN     
,SUCURSAL    
,CUENTA      
,SUBTOTAL	 
,CLIENTE	 
,CANTIDAD	 
,FECHA_DOC   
,EXIST_ANT   
,EXIST_POST	 
,HORA		 
,REFERENCIA	 
,DETALLE	 	
)

-----------------PASO 6----------------
UPDATE DBO.MERCAN 
	SET FECHA_U_V = 123456--Fecha ultima venta
	   ,DOC_U_V = 123123--Documento ultima venta
WHERE CODIGO = @article

-----------------PASO 7---------------- 
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
 ORDEN
,HORA
,FECHA
,ACCION
,COMENTARIO
,COMENTARIO2
,TIPO_DOC
,USUARIO
,NIVEL
,MODULO
) 

-----------------PASO 8---------------- 
UPDATE dbo.facturas SET ORDEN = @P1 WHERE NUMERO = @P2

-----------------PASO 9---------------- 
select SUB_GRUPO,* from mercan where SUB_GRUPO > 0

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
where codigo = @article --clase del articulo

select CODIGO,NOMBRE from DEP_INV where codigo = @article --columna DPTO del articulo

select 
	 CODIGO
	,GRUPO 
	,DESCRIPCION 
from Subgrupo 
where CODIGO = @article --SUB_GRUPO del articulo
  and GRUPO = 'NO SE DONDE SACAR GRUPO' --TODO: no se donde encontrar el grupo

SELECT SUPLIDOR,CODIGO,DESCRIPCION FROM DBO.FAM_SUP WHERE SUPLIDOR = @P1 AND CODIGO = @P2 --VACIO

SELECT CODIGO,NOMBRE FROM DBO.FABRICA WHERE CODIGO = @P1 --PRACTICAMENTE VACIO

SELECT CODIGO,DESCRIPCION,FABRICANTE FROM dbo.marcas WHERE FABRICANTE = @P1 AND CODIGO = @P2  --VACIO

SELECT CODIGO,DESCRIPCION FROM DBO.UBICA WHERE CODIGO = @article --columna LOC 

-----------------PASO 10----------------   
select  * from FABRICA
SELECT FABRICANTE,* FROM MERCAN
select * from MERCAN WHERE CODIGO IN (select TOP (10)MERCANCIA from D_FACTS where SECUENCIA > 0)
SELECT * FROM DEP_INV
SELECT DPTO,* FROM MERCAN WHERE DPTO > 0

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

 