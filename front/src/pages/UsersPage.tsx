import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa"; 
import { FaUserTie } from "react-icons/fa"; 



interface User {
  _id: string;
  nombre: string;
  apellidos: string;
  role: string;
  telefono?: string;
  direccion?: string;
  email: string;
  status?: string;
  creadoEn?: string;
}

interface UsersPageProps {
  setCurrentPage: (page: string) => void;
}

export default function UsersPage({ setCurrentPage }: UsersPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('es');
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    role: 'empleado',
    telefono: '',
    direccion: ''
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLanguage = localStorage.getItem('language') || 'es';
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    fetchUsers();
  }, []);

  const texts = {
    es: {
      usersManagement: "Gestión de Usuarios",
      backToDashboard: "Volver al Dashboard",
      manageUsers: "Administra los usuarios del sistema",
      createUser: "Crear Usuario",
      totalUsers: "Total Usuarios",
      administrators: "Administradores",
      managers: "Gerentes",
      employees: "Empleados",
      user: "Usuario",
      role: "Rol",
      contact: "Contacto",
      status: "Estado",
      registrationDate: "Fecha de Registro",
      actions: "Acciones",
      active: "Activo",
      inactive: "Inactivo",
      you: "Tú",
      editUser: "Editar Usuario",
      deleteUser: "Eliminar Usuario",
      noUsers: "No hay usuarios",
      createFirstUser: "Crea el primer usuario para comenzar",
      editingUser: "Editar Usuario",
      creatingUser: "Crear Usuario",
      name: "Nombre",
      lastName: "Apellidos",
      email: "Correo Electrónico",
      password: "Contraseña",
      phone: "Teléfono",
      address: "Dirección",
      cancel: "Cancelar",
      updateUser: "Actualizar Usuario",
      loading: "Cargando usuarios...",
      leaveEmptyNoChange: "Dejar vacío para no cambiar",
      minCharacters: "Mínimo 6 caracteres",
      required: "*",
      admin: "Administrador",
      gerente: "Gerente",
      empleado: "Empleado"
    },
    en: {
      usersManagement: "User Management",
      backToDashboard: "Back to Dashboard",
      manageUsers: "Manage system users",
      createUser: "Create User",
      totalUsers: "Total Users",
      administrators: "Administrators",
      managers: "Managers",
      employees: "Employees",
      user: "User",
      role: "Role",
      contact: "Contact",
      status: "Status",
      registrationDate: "Registration Date",
      actions: "Actions",
      active: "Active",
      inactive: "Inactive",
      you: "You",
      editUser: "Edit User",
      deleteUser: "Delete User",
      noUsers: "No users",
      createFirstUser: "Create the first user to start",
      editingUser: "Edit User",
      creatingUser: "Create User",
      name: "Name",
      lastName: "Last Name",
      email: "Email",
      password: "Password",
      phone: "Phone",
      address: "Address",
      cancel: "Cancel",
      updateUser: "Update User",
      loading: "Loading users...",
      leaveEmptyNoChange: "Leave empty to not change",
      minCharacters: "Minimum 6 characters",
      required: "*",
      admin: "Administrator",
      gerente: "Manager",
      empleado: "Employee"
    }
  };

  const t = texts[language] || texts.es;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch("http://localhost:6001/int/user/all", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // El backend devuelve { userList: [...] } según el README
      const usersList = data.userList || data.users || data.data || data || [];
      setUsers(Array.isArray(usersList) ? usersList : []);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage(`Error al cargar usuarios: ${error.message}`, 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellidos: '',
      email: '',
      password: '',
      role: 'empleado',
      telefono: '',
      direccion: ''
    });
    setEditingUser(null);
  };

  const handleCreateUser = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setFormData({
      nombre: user.nombre,
      apellidos: user.apellidos,
      email: user.email,
      password: '',
      role: user.role,
      telefono: user.telefono || '',
      direccion: user.direccion || ''
    });
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.apellidos || !formData.email) {
      showMessage('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    if (!editingUser && !formData.password) {
      showMessage('La contraseña es requerida para nuevos usuarios', 'error');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const url = editingUser 
        ? `http://localhost:6001/int/user/update/${editingUser._id}`
        : 'http://localhost:6001/int/user/save';
      
      const method = editingUser ? 'PATCH' : 'POST';
      
      const body: any = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        role: formData.role,
        telefono: formData.telefono,
        direccion: formData.direccion,
        status: 'activo'
      };

      if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(
          editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente',
          'success'
        );
        setTimeout(() => {
  setShowModal(false);
  resetForm();
  fetchUsers();
}, 3000);
      } else {
        showMessage(data.message || 'Error al procesar la solicitud', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión con el servidor', 'error');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === currentUser._id) {
      showMessage('No puedes eliminar tu propio usuario', 'error');
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${userName}?`)) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:6001/int/user/delete/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          showMessage('Usuario eliminado exitosamente', 'success');
          fetchUsers();
        } else {
          const data = await response.json();
          showMessage(data.message || 'Error al eliminar usuario', 'error');
        }
      } catch (error) {
        showMessage('Error de conexión con el servidor', 'error');
      }
    }
  };

  const getRoleBadgeClass = (role: string) => {
    const baseClasses = theme === 'dark' 
      ? 'text-gray-100' 
      : '';
    
    switch (role) {
      case 'admin': 
        return `${baseClasses} ${theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`;
      case 'gerente': 
        return `${baseClasses} ${theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`;
      case 'empleado': 
        return `${baseClasses} ${theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`;
      default: 
        return `${baseClasses} ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'gerente': return '💼';
      case 'empleado': return '👤';
      default: return '👤';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return t.admin;
      case 'gerente': return t.gerente;
      case 'empleado': return t.empleado;
      default: return role;
    }
  };

if (loading) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 to-slate-800'
        : 'bg-gradient-to-br from-primary to-secondary'
    }`}>
      <div className={`${
        theme === 'dark'
          ? 'bg-slate-800/95 border-amber-600/30 text-amber-100'
          : 'bg-white/95 border-slate-300 text-slate-700'
      } backdrop-blur-sm rounded-3xl shadow-2xl p-8 border`}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mb-4"></div>
          <p className={`text-center mt-4 font-semibold ${
            theme === 'dark' ? 'text-amber-400' : 'text-primary'
          }`}>
            {t.loading}
          </p>
        </div>
      </div>
    </div>
  );
}

  return (
     <div className={`min-h-screen ${theme === "dark"
    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    : "bg-gradient-to-br from-primary via-primary/80 to-secondary"
  } transition-colors duration-300`}>
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
        <h1
      className={`text-4xl font-bold mb-2 ${
        theme === "dark" ? "text-amber-300" : "text-white"
      }`}
      style={{ fontFamily: "'Playfair Display', serif" }}
    >
      <FaUserTie className="inline-block mb-1 mr-2" /> {t.usersManagement}
    </h1>
          <p className={theme === "dark" ? "text-slate-300" : "text-white"}>
            {t.manageUsers}
          </p>
        </div>
        {(currentUser.role === 'admin' || currentUser.role === 'gerente') && (
          <button
            onClick={handleCreateUser}
            className={`flex items-center gap-2 ${
              theme === "dark"
                ? "bg-amber-700 text-white hover:bg-amber-800"
                : "bg-primary text-white hover:bg-secondary"
            } px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg`}
          >
            <FaPlus /> {t.createUser}
          </button>
        )}
</div>

{/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`rounded-xl shadow-lg p-6 border ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>{t.totalUsers}</p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
        <div className={`rounded-xl shadow-lg p-6 border ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>{t.administrators}</p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👑</span>
            </div>
          </div>
        </div>
        <div className={`rounded-xl shadow-lg p-6 border ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>{t.managers}</p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {users.filter(u => u.role === 'gerente').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💼</span>
            </div>
          </div>
        </div>
        <div className={`rounded-xl shadow-lg p-6 border ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>{t.employees}</p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {users.filter(u => u.role === 'empleado').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          </div>
        </div>
      </div>

  {/* Users Table */}
<div className={`rounded-2xl shadow-lg overflow-hidden border ${
  theme === 'dark'
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-primary'
}`}>
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-amber-50'}`}>
        <tr>
          <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
            theme === 'dark' ? 'text-gray-300' : 'text-primary'
          }`}>{t.user}</th>
          <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
            theme === 'dark' ? 'text-gray-300' : 'text-primary'
          }`}>{t.role}</th>
          <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
            theme === 'dark' ? 'text-gray-300' : 'text-primary'
          }`}>{t.contact}</th>
          <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
            theme === 'dark' ? 'text-gray-300' : 'text-primary'
          }`}>{t.status}</th>
          <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
            theme === 'dark' ? 'text-gray-300' : 'text-primary'
          }`}>{t.registrationDate}</th>
          {(currentUser.role === 'admin' || currentUser.role === 'gerente') && (
            <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-300' : 'text-primary'
            }`}>{t.actions}</th>
          )}
        </tr>
      </thead>
      <tbody className={`divide-y ${
        theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-primary'
      }`}>
        {users.map((user) => (
          <tr key={user._id} className={`transition-colors ${
            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-amber-50'
          }`}>
            <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? '' : 'text-gray-900'}`}>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user.nombre} {user.apellidos}
                    {user._id === currentUser._id && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {t.you}
                      </span>
                    )}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</div>
                </div>
              </div>
            </td>
            <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? '' : 'text-gray-900'}`}>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                <span>{getRoleIcon(user.role)}</span>
                {getRoleText(user.role)}
              </span>
            </td>
            <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? '' : 'text-gray-900'}`}>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                {user.telefono && (
                  <div className="flex items-center gap-1">
                    <span>📱</span>
                    {user.telefono}
                  </div>
                )}
                {user.direccion && (
                  <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>🏠</span>
                    {user.direccion}
                  </div>
                )}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                user.status === 'activo' 
                  ? theme === 'dark' 
                    ? 'bg-green-900 text-green-200' 
                    : 'bg-green-100 text-green-800'
                  : theme === 'dark'
                    ? 'bg-red-900 text-red-200'
                    : 'bg-red-100 text-red-800'
              }`}>
                {user.status === 'activo' ? `✅ ${t.active}` : `❌ ${t.inactive}`}
              </span>
            </td>
            <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {user.creadoEn ? new Date(user.creadoEn).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US') : 'N/A'}
            </td>
            {(currentUser.role === 'admin' || currentUser.role === 'gerente') && (
              <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${theme === 'dark' ? '' : 'text-gray-900'}`}>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className={`transition-colors p-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' 
                        : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
                    }`}
                    title={t.editUser}
                  >
                    ✏️
                  </button>
                  {user._id !== currentUser._id && (
                    <button
                      onClick={() => handleDeleteUser(user._id, `${user.nombre} ${user.apellidos}`)}
                      className={`transition-colors p-2 rounded-lg ${
                        theme === 'dark' 
                          ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' 
                          : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                      }`}
                      title={t.deleteUser}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
      {/* Empty state */}
      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className={`${theme === "dark" ? "bg-slate-800/80" : "bg-white/90"} backdrop-blur-sm rounded-3xl p-8 inline-block`}>
            <div className="text-6xl mb-4">👥</div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t.noUsers}</h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t.createFirstUser}</p>
            {(currentUser.role === 'admin' || currentUser.role === 'gerente') && (
              <button
                onClick={handleCreateUser}
                className={`flex items-center gap-2 ${theme === "dark"
                  ? "bg-amber-700 text-white hover:bg-amber-800"
                  : "bg-primary text-white hover:bg-secondary"
                } px-6 py-3 rounded-full font-semibold transition-all duration-300 mt-6`}
              >
                <FaPlus /> {t.createUser}
              </button>
          )}
          </div>
        </div>
      )}
    </div>
  
      
{showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50">
    <div className="w-full flex justify-center min-h-screen">
      <div className={`${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'} rounded-2xl p-0 w-full max-w-2xl flex flex-row shadow-xl mx-1 mt-24 mb-16`}>
        {/* Panel decorativo izquierdo más pequeño */}
        <div className={`hidden md:flex flex-col items-center justify-center px-3 py-4 rounded-l-2xl ${theme === "dark" ? "bg-slate-900" : "bg-primary/90"}`}>
          <FaUserTie className={`text-3xl mb-2 ${theme === "dark" ? "text-amber-400" : "text-white"}`} />
          <span className={`text-base font-bold text-center ${theme === "dark" ? "text-amber-200" : "text-white"}`}>
            {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
          </span>
        </div>

       {/* Formulario horizontal más compacto verticalmente */}
<div className="flex-1 px-8 py-4 text-[18px] flex flex-col">
  <h2 className={`text-[22px] font-bold mb-3 ${theme === "dark" ? "text-amber-400" : "text-primary"}`}>
    {editingUser ? `✏️ ${t.editingUser}` : `➕ ${t.creatingUser}`}
  </h2>
  {/* Message Alert - ahora arriba de los campos */}
  {message && (
    <div
      className={`mb-4 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 border font-bold text-base justify-center ${
        messageType === 'success'
          ? theme === 'dark'
            ? 'bg-green-900 text-green-200 border-green-700'
            : 'bg-green-50 text-green-700 border-green-200'
          : theme === 'dark'
            ? 'bg-red-900 text-red-200 border-red-700'
            : 'bg-red-50 text-red-700 border-red-200'
      }`}
      style={{ minHeight: '48px' }}
    >
      <span className="text-2xl">
        {messageType === 'success' ? '✅' : '⚠️'}
      </span>
      <span className="text-lg">{message}</span>
    </div>
  )}




          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-2">
                  <label className="block font-semibold mb-1 text-base">{t.name} {t.required}</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-base ${theme === "dark" ? "bg-slate-900 text-slate-100 border-slate-700" : "bg-white text-gray-900 border-gray-300"}`}
                    required
                    placeholder="Ej: Juan"
                  />
                </div>
                <div className="mb-2">
                  <label className="block font-semibold mb-1 text-base">{t.lastName} {t.required}</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-base ${theme === "dark" ? "bg-slate-900 text-slate-100 border-slate-700" : "bg-white text-gray-900 border-gray-300"}`}
                    required
                    placeholder="Ej: Pérez"
                  />
                </div>
                <div className="mb-2">
                  <label className="block font-semibold mb-1 text-base">📧 {t.email} {t.required}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-base ${theme === "dark" ? "bg-slate-900 text-slate-100 border-slate-700" : "bg-white text-gray-900 border-gray-300"}`}
                    required
                    placeholder="ejemplo@email.com"
                  />
                </div>
                <div className="mb-2">
                  <label className="block font-semibold mb-1 text-base">🔒 {t.password} {!editingUser && t.required}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-base ${theme === "dark" ? "bg-slate-900 text-slate-100 border-slate-700" : "bg-white text-gray-900 border-gray-300"}`}
                    placeholder={editingUser ? t.leaveEmptyNoChange : t.minCharacters}
                    required={!editingUser}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2">
                  <label className="block font-semibold mb-1 text-base">👤 {t.role} {t.required}</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-base ${theme === "dark" ? "bg-slate-900 text-slate-100 border-slate-700" : "bg-white text-gray-900 border-gray-300"}`}
                    required
                  >
                    <option value="empleado">👤 {t.employees}</option>
                    <option value="gerente">💼 {t.managers}</option>
                    {currentUser.role === 'admin' && (
                      <option value="admin">👑 {t.administrators}</option>
                    )}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block font-semibold mb-1 text-base">📱 {t.phone}</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-base ${theme === "dark" ? "bg-slate-900 text-slate-100 border-slate-700" : "bg-white text-gray-900 border-gray-300"}`}
                    placeholder="Ej: 3312345678"
                  />
                </div>
                <div className="mb-2">
                  <label className="block font-semibold mb-1 text-base">🏠 {t.address}</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-base ${theme === "dark" ? "bg-slate-900 text-slate-100 border-slate-700" : "bg-white text-gray-900 border-gray-300"}`}
                    placeholder="Ej: Calle 123, Colonia"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className={`flex-1 bg-gray-200 text-gray-800 py-2 rounded-xl font-semibold hover:bg-gray-300 transition text-base`}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className={`flex-1 bg-primary text-white py-2 rounded-xl font-semibold hover:bg-secondary transition text-base`}
              >
                {editingUser ? `💾 ${t.updateUser}` : `➕ ${t.createUser}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}