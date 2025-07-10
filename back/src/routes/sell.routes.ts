import { Router } from "express";
import { 
    createSell, 
    deleteSell, 
    getAllSells, 
    getSellById, 
    updateSell,
    debugStockMapping
} from "../controllers/sells.controller";

const router = Router();

router.get("/all", getAllSells);
router.get("/find/:id", getSellById);
router.post("/save", createSell);
router.patch("/update/:id", updateSell);
router.delete("/delete/:id", deleteSell);
router.get("/debug-mapping", debugStockMapping);

export default router;