import {Router} from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/products.controller";

const router = Router();

//  Usar: /int/products
router.get("/all", getAllProducts);
router.get("/find/:id", getProductById);
router.post("/save", createProduct);
router.patch("/update/:id", updateProduct)
router.delete("/delete/:id", deleteProduct);




export default router;