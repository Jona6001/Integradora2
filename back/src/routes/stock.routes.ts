import {Router} from "express";
import { createStock, deleteStock, getAllStock, getStockById, updateStock } from "../controllers/stock.controller";



const router = Router();

//  Usar: /int/stock
router.get("/all", getAllStock);
router.get("/find/:id", getStockById);
router.post("/save", createStock);
router.patch("/update/:id", updateStock);
router.delete("/delete/:id", deleteStock);




export default router;