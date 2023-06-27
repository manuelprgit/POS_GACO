import { Router } from 'express';
import { 
    getProducts,
    postInvoice,
    getProductById,
    getProductByBarCode
} from '../controllers/products.controller'

const baseUrl = '/api/product/';

const router = Router();

router.get(`${baseUrl}:barcode`, getProductById);

router.post(`${baseUrl}`, getProductByBarCode);


// router.get(baseUrl, getProducts);

// router.put(baseUrl);

// router.post(baseUrl,postInvoice);

// router.delete(baseUrl);



export default router