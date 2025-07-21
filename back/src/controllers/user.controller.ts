import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/usuarios.models';
import { sendEmail } from '../utils/sendEmail';

// Mapa para usuarios con contraseñas temporales
const temporaryPasswordUsers = new Map<string, boolean>();


// OBTENER TODOS LOS USUARIOS
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find({ status: { $ne: "inactivo" } }).select('-password');
        res.json(users);
    } catch (error) {
        console.error('❌ Error al obtener usuarios:', error);
        res.status(500).json({ message: "Error al obtener usuarios", error });
    }
};

// OBTENER USUARIO POR ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }
        
        res.json(user);
    } catch (error) {
        console.error('❌ Error al obtener usuario:', error);
        res.status(500).json({ message: "Error al obtener usuario", error });
    }
};

//  OBTENER PERFIL DEL USUARIO LOGUEADO
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ message: "Token no proporcionado" });
            return;
        }

        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET || 'defaultSecret';
        
        try {
            const decoded = jwt.verify(token, jwtSecret) as any;
            const userId = decoded.userId || decoded.id;

            const user = await User.findById(userId).select('-password');
            
            if (!user) {
                res.status(404).json({ message: "Usuario no encontrado" });
                return;
            }

            console.log('✅ Perfil obtenido para usuario:', user.nombre);
            res.json(user);
        } catch (jwtError) {
            console.error('❌ Error verificando token:', jwtError);
            res.status(401).json({ message: "Token inválido" });
        }
    } catch (error) {
        console.error('❌ Error al obtener perfil:', error);
        res.status(500).json({ message: "Error al obtener perfil", error });
    }
};

// LOGIN
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, password } = req.body;

        if (!nombre || !password) {
            res.status(400).json({ message: "Nombre y contraseña son requeridos" });
            return;
        }

        const user = await User.findOne({ nombre: nombre }) as (typeof User.prototype & { _id: any });
        
        if (!user) {
            res.status(401).json({ message: "Credenciales incorrectas" });
            return;
        }

        if (user.status === "inactivo") {
            res.status(401).json({ message: "Usuario inactivo. Contacta al administrador." });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            res.status(401).json({ message: "Credenciales incorrectas" });
            return;
        }

        // Generar token JWT
        const jwtSecret = process.env.JWT_SECRET || 'defaultSecret';
        const token = jwt.sign(
            { 
                userId: user._id, 
                nombre: user.nombre, 
                role: user.role 
            },
            jwtSecret,
            { expiresIn: '24h' }
        );

        // Datos del usuario para el frontend (sin password)
        const userData = {
            _id: user._id,
            nombre: user.nombre,
            apellidos: user.apellidos,
            email: user.email,
            role: user.role,
            telefono: user.telefono,
            direccion: user.direccion,
            status: user.status,
            creadoEn: user.creadoEn
        };

        console.log('✅ Login exitoso para:', user.nombre);
        res.json({ 
            message: "Login exitoso", 
            user: userData,
            token: token,
            hasTemporaryPassword: temporaryPasswordUsers.has(user._id.toString())
        });
    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({ message: "Error en el servidor", error });
    }
};

// CREAR USUARIO
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre, apellidos, password, email, role, telefono, direccion, status } = req.body;

        // Validaciones
        if (!nombre || !apellidos || !password || !email || !role) {
            res.status(400).json({ message: "Campos requeridos: nombre, apellidos, password, email, role" });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
            return;
        }

        // Verificar si ya existe
        const existingUser = await User.findOne({ 
            $or: [{ nombre }, { email }] 
        });

        if (existingUser) {
            res.status(400).json({ message: "Ya existe un usuario con ese nombre o email" });
            return;
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            nombre,
            apellidos,
            password: hashedPassword,
            email,
            role,
            telefono: telefono || '',
            direccion: direccion || '',
            status: status || "activo",
            creadoEn: new Date()
        });

        const user = await newUser.save() as typeof User.prototype;
        
        // Si la contraseña es temporal, agregar al mapa
        if (password === nombre || password === "123456" || password === "temporal") {
            temporaryPasswordUsers.set((user as { _id: any })._id.toString(), true);
        }

        console.log('✅ Usuario creado:', user.nombre);
        res.status(201).json({ message: "Usuario creado exitosamente", user: { ...user.toObject(), password: undefined } });
    } catch (error) {
        console.error('❌ Error al crear usuario:', error);
        res.status(500).json({ message: "Error al crear usuario", error });
    }
};

// ACTUALIZAR USUARIO
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { password, role, nombre, apellidos, telefono, direccion, status, email } = req.body;

        const updateData: any = {};
        
        if (password) {
            if (password.length < 6) {
                res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
                return;
            }
            updateData.password = await bcrypt.hash(password, 10);
            // Si admin cambia la contraseña, remover de temporales
            temporaryPasswordUsers.delete(id);
        }
        
        if (role) updateData.role = role;
        if (nombre) updateData.nombre = nombre;
        if (apellidos) updateData.apellidos = apellidos;
        if (telefono !== undefined) updateData.telefono = telefono;
        if (direccion !== undefined) updateData.direccion = direccion;
        if (status) updateData.status = status;
        if (email) updateData.email = email;

        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password');

        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }
        
        console.log('✅ Usuario actualizado:', user.nombre);
        res.json({ message: "Usuario actualizado exitosamente", user });
    } catch (error) {
        console.error('❌ Error al actualizar usuario:', error);
        res.status(500).json({ message: "Error al actualizar usuario", error });
    }
};

// ELIMINAR USUARIO (SOFT DELETE)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        const user = await User.findByIdAndUpdate(
            id,
            { 
                status: "inactivo", 
                eliminadoEn: new Date() 
            },
            { new: true }
        );
        
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return;
        }

        // Remover de temporales si está eliminado
        temporaryPasswordUsers.delete(id);
        
        console.log(' Usuario eliminado:', user.nombre);
        res.json({ message: "Usuario eliminado exitosamente", user });
    } catch (error) {
        console.error(' Error al eliminar usuario:', error);
        res.status(500).json({ message: "Error al eliminar usuario", error });
    }
};

// VERIFICAR CONTRASEÑA TEMPORAL
export const checkTemporaryPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const hasTemporaryPassword = temporaryPasswordUsers.has(userId);
        
        res.json({ hasTemporaryPassword });
    } catch (error) {
        console.error('❌ Error verificando contraseña temporal:', error);
        res.status(500).json({ message: "Error al verificar contraseña", error });
    }
};

// RECUPERAR CONTRASEÑA (ENVÍO DE CORREO CON CONTRASEÑA TEMPORAL)
export const recoverPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: "El correo electrónico es requerido" });
            return;
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "No existe un usuario con ese correo electrónico" });
            return;
        }

        // Generar contraseña temporal
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        user.password = hashedPassword;
        await user.save();

        // Marcar como contraseña temporal
        temporaryPasswordUsers.set((user as { _id: any })._id.toString(), true);

        // Enviar correo con la contraseña temporal
        await sendEmail(
            user.email,
            "Recuperación de contraseña - Lonches El Primo",
            `Hola ${user.nombre},\n\nTu nueva contraseña temporal es: ${tempPassword}\n\nPor seguridad, cámbiala al iniciar sesión.\n\nSi no solicitaste este cambio, ignora este mensaje.`
        );

        console.log(`✅ Correo de recuperación enviado a: ${user.email}`);
        res.json({ message: "Se ha enviado un correo con la nueva contraseña temporal." });
    } catch (error) {
        console.error('❌ Error en recuperación de contraseña:', error);
        res.status(500).json({ message: "Error al enviar el correo de recuperación", error });
    }
};

// RESTABLECER CONTRASEÑA POR EMAIL (cuando el usuario ya tiene la temporal)
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword || newPassword.length < 6) {
            res.status(400).json({ message: "Email y nueva contraseña (mínimo 6 caracteres) son requeridos" });
            return;
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado con ese correo" });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        // Marcar como contraseña temporal si es genérica
        if (newPassword === user.nombre || newPassword === "123456" || newPassword === "temporal") {
            temporaryPasswordUsers.set((user as { _id: any })._id.toString(), true);
        } else {
            temporaryPasswordUsers.delete((user as { _id: any })._id.toString());
        }

        // Opcional: enviar correo de confirmación
        await sendEmail(
            user.email,
            "Contraseña restablecida",
            "Tu contraseña ha sido restablecida correctamente."
        );

        console.log(' Contraseña restablecida para:', user.nombre);
        res.json({ message: "Contraseña restablecida exitosamente", user: { ...user.toObject(), password: undefined } });
    } catch (error) {
        console.error(' Error al restablecer contraseña:', error);
        res.status(500).json({ message: "Error al restablecer contraseña", error });
    }
};