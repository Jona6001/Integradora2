
import React, { useState, useEffect } from "react";
import RegisterPage from "../../pages/RegisterPage";
import { FaSearch, FaUserEdit, FaTrash, FaSignOutAlt } from "react-icons/fa";

export default function UserMenuModal({ onClose, puedeCrearUsuario }) {
  const [showRegister, setShowRegister] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:6001/int/user/all")
      .then(res => res.json())
      .then(data => setUsers(data.userList || []));
  }, [showRegister]);

  const filteredUsers = users.filter(
    u =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative w-full max-w-lg mx-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-primary text-2xl font-bold z-10 transition"
          onClick={onClose}
          aria-label="Cerrar"
          type="button"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-primary">Gestión de usuarios</h2>
        {puedeCrearUsuario && !showRegister && (
          <button
            className="mb-4 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary transition"
            onClick={() => setShowRegister(true)}
          >
            Crear usuario
          </button>
        )}
        {showRegister ? (
          <RegisterPage onBack={() => setShowRegister(false)} />
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredUsers.map(u => (
                <div key={u._id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <span className="font-semibold">{u.nombre} {u.apellidos}</span>
                    <span className="ml-2 text-xs text-gray-500">({u.role})</span>
                  </div>
                  {puedeCrearUsuario && (
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800" title="Editar">
                        <FaUserEdit />
                      </button>
                      <button className="text-red-600 hover:text-red-800" title="Eliminar">
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              className="mt-6 w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
              onClick={() => {
                localStorage.removeItem("auth");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                window.location.reload();
              }}
            >
              <FaSignOutAlt />
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
}