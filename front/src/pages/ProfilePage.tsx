import React, { useState, useEffect } from 'react';

interface User {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  role: string;
  telefono?: string;
  direccion?: string;
  status?: string;
  creadoEn?: string;
}

interface ProfilePageProps {
  setCurrentPage: (page: string) => void;
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export default function ProfilePage({ setCurrentPage, user, onUpdateUser }: ProfilePageProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // 👇 USAR EL ENDPOINT EXISTENTE getUserById PARA CARGAR DATOS FRESCOS
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (user?._id && token) {
          console.log('🔄 Cargando datos frescos del usuario...');
          
          const response = await fetch(`http://localhost:6001/int/user/find/${user._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            console.log('✅ Datos frescos obtenidos:', userData);
            
            // Actualizar localStorage con datos frescos
            localStorage.setItem('user', JSON.stringify(userData));
            setCurrentUser(userData);
            
            setFormData({
              nombre: userData.nombre || '',
              apellidos: userData.apellidos || '',
              email: userData.email || '',
              telefono: userData.telefono || '',
              direccion: userData.direccion || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
            return;
          }
        }

        // Fallback a datos existentes
        console.log('📂 Usando datos existentes');
        setCurrentUser(user);
        setFormData({
          nombre: user?.nombre || '',
          apellidos: user?.apellidos || '',
          email: user?.email || '',
          telefono: user?.telefono || '',
          direccion: user?.direccion || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        // Fallback a user prop
        setCurrentUser(user);
      }
    };

    loadUserData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const updateData: any = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion
      };

      console.log('📤 Enviando actualización:', updateData);

      const response = await fetch(`http://localhost:6001/int/user/update/${currentUser?._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (response.ok) {
        // Usar la respuesta del servidor que incluye todos los datos
        const updatedUser = data.user || { ...currentUser, ...updateData };
        
        console.log('✅ Usuario actualizado:', updatedUser);
        
        // Actualizar localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Actualizar estado local
        setCurrentUser(updatedUser);
        
        // Notificar al componente padre
        onUpdateUser(updatedUser);
        
        showMessage('✅ Perfil actualizado exitosamente', 'success');
      } else {
        showMessage(`❌ ${data.message || 'Error al actualizar perfil'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('❌ Error de conexión con el servidor', 'error');
    }

    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      showMessage('❌ Completa todos los campos de contraseña', 'error');
      return;
    }

    if (formData.newPassword.length < 6) {
      showMessage('❌ La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showMessage('❌ Las contraseñas no coinciden', 'error');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      // Primero verificar la contraseña actual
      const loginResponse = await fetch('http://localhost:6001/int/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: currentUser?.nombre,
          password: formData.currentPassword
        })
      });

      if (!loginResponse.ok) {
        showMessage('❌ Contraseña actual incorrecta', 'error');
        setLoading(false);
        return;
      }

      // Si la contraseña actual es correcta, actualizar
      const updateResponse = await fetch(`http://localhost:6001/int/user/update/${currentUser?._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          password: formData.newPassword
        })
      });

      const data = await updateResponse.json();

      if (updateResponse.ok) {
        showMessage('✅ Contraseña actualizada exitosamente', 'success');
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordSection(false);
      } else {
        showMessage(`❌ ${data.message || 'Error al actualizar contraseña'}`, 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage('❌ Error de conexión con el servidor', 'error');
    }

    setLoading(false);
  };

  const displayUser = currentUser || user;

  if (!displayUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="inline-flex items-center gap-2 text-primary hover:text-secondary font-semibold transition-colors mb-4"
          >
            <span className="text-lg">←</span>
            Volver al Dashboard
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {displayUser?.nombre?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {displayUser?.nombre} {displayUser?.apellidos}
                </h1>
                <div className="flex flex-wrap items-center gap-4">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    displayUser?.role === 'admin' ? 'bg-red-100 text-red-800' :
                    displayUser?.role === 'gerente' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {displayUser?.role === 'admin' ? '👑' : displayUser?.role === 'gerente' ? '💼' : '👤'}
                    {displayUser?.role}
                  </span>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    displayUser?.status === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {displayUser?.status === 'activo' ? '✅' : '❌'}
                    {displayUser?.status || 'Activo'}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p><strong>ID:</strong> {displayUser?._id}</p>
                <p><strong>Registro:</strong> {displayUser?.creadoEn ? new Date(displayUser.creadoEn).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'No disponible'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Información Completa del Usuario */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Datos Personales */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              👤 Datos Personales
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-semibold">Nombre Completo</p>
                <p className="text-lg font-semibold text-gray-800">{displayUser?.nombre} {displayUser?.apellidos}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-semibold">Usuario</p>
                <p className="text-lg font-semibold text-gray-800">{displayUser?.nombre}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-semibold">Rol en el Sistema</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">{displayUser?.role}</p>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📞 Contacto
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-semibold">📧 Correo Electrónico</p>
                <p className="text-lg font-semibold text-gray-800">{displayUser?.email || 'No registrado'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-semibold">📱 Teléfono</p>
                <p className="text-lg font-semibold text-gray-800">{displayUser?.telefono || 'No registrado'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-semibold">🏠 Dirección</p>
                <p className="text-lg font-semibold text-gray-800">{displayUser?.direccion || 'No registrada'}</p>
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🔧 Sistema
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-semibold">🆔 ID de Usuario</p>
                <p className="text-sm font-mono text-gray-800 break-all">{displayUser?._id}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-semibold">📅 Fecha de Registro</p>
                <p className="text-lg font-semibold text-gray-800">
                  {displayUser?.creadoEn ? new Date(displayUser.creadoEn).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'No disponible'}
                </p>
                <p className="text-sm text-gray-500">
                  {displayUser?.creadoEn ? `a las ${new Date(displayUser.creadoEn).toLocaleTimeString('es-ES')}` : ''}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-semibold">🔄 Estado de Cuenta</p>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    displayUser?.status === 'activo' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <p className="text-lg font-semibold text-gray-800 capitalize">
                    {displayUser?.status || 'Activo'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario de Edición */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              ✏️ Editar Información Personal
            </h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  📧 Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  📱 Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  🏠 Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                    Actualizando...
                  </>
                ) : (
                  <>
                    💾 Guardar Cambios
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Seguridad */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🔐 Seguridad
            </h2>
            
            {!showPasswordSection ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Cambiar Contraseña
                </h3>
                <p className="text-gray-600 mb-6">
                  Mantén tu cuenta segura actualizando tu contraseña regularmente
                </p>
                <button
                  onClick={() => setShowPasswordSection(true)}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition"
                >
                  🔑 Cambiar Contraseña
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    🔒 Contraseña Actual
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    🔐 Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    🔐 Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setFormData({
                        ...formData,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                        Cambiando...
                      </>
                    ) : (
                      <>
                        🔄 Cambiar Contraseña
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 text-2xl">💡</div>
            <div className="text-blue-700">
              <h3 className="font-semibold mb-2">Consejos de Seguridad</h3>
              <ul className="text-sm space-y-1">
                <li>• Usa una contraseña única y segura</li>
                <li>• No compartas tus credenciales con otros</li>
                <li>• Mantén tu información de contacto actualizada</li>
                <li>• Cierra sesión al terminar de usar el sistema</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}