import express from 'express';
import cors from 'cors';
import connectDB from './config/db';

// Importar rutas
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import stockRoutes from './routes/stock.routes';
import sellsRoutes from './routes/sell.routes';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 6001;

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors({
  origin: '*', // 👈 Permitir cualquier origen para desarrollo
  credentials: true
}));
app.use(express.json());

// Rutas
app.use('/int/user', userRoutes);
app.use('/int/products', productRoutes);
app.use('/int/stock', stockRoutes);
app.use('/int/sells', sellsRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

// 👈 Hacer que el servidor escuche en todas las interfaces
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📱 Accesible desde: http://0.0.0.0:${PORT}`);
});