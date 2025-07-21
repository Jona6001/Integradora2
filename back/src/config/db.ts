import mongoose from 'mongoose';

const connection = async (): Promise<void> => {
    // Agregar el nombre de la base de datos específica
    const mongoUrl = 'mongodb+srv://jonathanrios601:jona@tarea.nsruenp.mongodb.net/Segunda_Integradora?retryWrites=true&w=majority&appName=tarea'; 
    
   // const mongoUrl = 'mongodb://localhost:27017/Segunda_Integradora'; 



    try {
        await mongoose.connect(mongoUrl, {
            // Estas opciones ayudan con la estabilidad de la conexión
            maxPoolSize: 10, // Mantiene hasta 10 conexiones socket
            serverSelectionTimeoutMS: 5000, // Tiempo de espera para seleccionar servidor
            socketTimeoutMS: 45000 
        });
        
        console.log('✅ MongoDB connected successfully to Segunda_Integradora');
        
        // Event listeners para monitorear la conexión
        mongoose.connection.on('error', (err) => {
            console.error(' MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn(' MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log(' MongoDB reconnected');
        });
        
    } catch (error) {
        console.error(' MongoDB connection error:', error);
        process.exit(1); 
    }
};

export default connection;