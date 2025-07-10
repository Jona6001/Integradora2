import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    getUserProfile,
    loginUser,
    createUser,
    updateUser,
    deleteUser,
    checkTemporaryPassword,
    resetPassword
} from '../controllers/user.controller';

const router = Router();

// 🔥 NUEVA RUTA: Obtener perfil del usuario logueado
router.get('/profile', getUserProfile);

// Rutas existentes
router.get('/all', getAllUsers);
router.get('/find/:id', getUserById);
router.post('/login', loginUser);
router.post('/save', createUser);
router.patch('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);
router.get('/check-temp/:userId', checkTemporaryPassword);
router.patch('/reset-password/:id', resetPassword);

export default router;