Para iniciar el proyecto BACKEND:
                            npm start

                Para iniciar el proyecto FRONTEND: 
                            npm install  
                            npm run dev


 RUTAS Y EJEMPLOS DE JSON PARA LA API:

==========================
USUARIOS (/int/user)
==========================

**Obtener todos los usuarios**
GET http://localhost:6001/int/user/all

**Crear usuario**
POST http://localhost:6001/int/user/save
{
  "nombre": "Javi",
  "apellidos": "Sandoval",
  "password": "javi",
  "email": "javi@ejemplo.com",
  "role": "gerente",
  "telefono": "6184454776",
  "direccion": "Divi Norte #456",
  "status": "activo"
}

**Login**
POST http://localhost:6001/int/user/login
{
  "nombre": "Javi",
  "password": "javi"
}

**Actualizar usuario**
PATCH http://localhost:6001/int/user/update/:id
{
  "nombre": "Carlos",
  "apellidos": "Ramírez",
  "password": "nuevoPassword123",
  "role": "gerente",
  "telefono": "5559876543",
  "direccion": "Calle Nueva #456",
  "status": "activo"
}

**Eliminar usuario**
DELETE http://localhost:6001/int/user/delete/:id

**Recuperar contraseña
http://localhost:6001/int/user/recover-pass
{
  "email": "javi@ejemplo.com"
}




==========================
PRODUCTOS (/int/products)
==========================

**Obtener todos los productos**
GET http://localhost:6001/int/products/all

**Obtener producto por ID**
GET http://localhost:6001/int/products/find/:id

**Crear producto**
POST http://localhost:6001/int/products/save
{
  "_id": 1,
  "nombre": "Torta de Jamón",
  "precio": 35,
  "tipo": "torta",
  "status": "activo"
}

**Actualizar producto**
PATCH http://localhost:6001/int/products/update/:id
{
  "nombre": "Torta de Pierna",
  "precio": 40,
  "tipo": "torta",
  "status": "activo"
}

**Eliminar producto**
DELETE http://localhost:6001/int/products/delete/:id

==========================
INVENTARIO/STOCK (/int/stock)
==========================

**Obtener todo el inventario**
GET http://localhost:6001/int/stock/all

**Obtener producto de inventario por ID**
GET http://localhost:6001/int/stock/find/:id

**Crear producto de inventario**
POST http://localhost:6001/int/stock/save
{
  "_id": 1,
  "producto": "Torta de Jamón",
  "cantidad": 50,
  "unidad": "piezas",
  "status": "activo"
}

**Actualizar producto de inventario**
PATCH http://localhost:6001/int/stock/update/:id
{
  "producto": "Torta de Jamón",
  "cantidad": 60,
  "unidad": "piezas",
  "status": "activo"
}

**Eliminar producto de inventario**
DELETE http://localhost:6001/int/stock/delete/:id

==========================
VENTAS (/int/sells)
==========================

**Obtener todas las ventas**
GET http://localhost:6001/int/sells/all

**Obtener venta por ID**
GET http://localhost:6001/int/sells/find/:id

**Crear venta**
POST http://localhost:6001/int/sells/save
{
  "productos": [
    {
      "producto_id": 1,
      "nombre": "Torta de Jamón",
      "cantidad": 2,
      "precio_unitario": 35,
      "subtotal": 70
    },
    {
      "producto_id": 2,
      "nombre": "Agua de Horchata",
      "cantidad": 1,
      "precio_unitario": 20,
      "subtotal": 20
    }
  ],
  "total": 90,
  "vendedor_id": 1,
  "status": "activo"
}

**Actualizar venta**
PATCH http://localhost:6001/int/sells/update/:id
{
  "productos": [
    {
      "producto_id": 1,
      "nombre": "Torta de Jamón",
      "cantidad": 3,
      "precio_unitario": 35,
      "subtotal": 105
    }
  ],
  "total": 105,
  "vendedor_id": 1,
  "status": "activo"
}

**Eliminar venta**
DELETE http://localhost:6001/int/sells/delete/:id
















//Cosas a cambiar 
Agregar = Recuperar contrasena

Formularios en Modales
Quitar seleccion de usuario


Documento cap 3 
-- Cambiar = Stake Holders 