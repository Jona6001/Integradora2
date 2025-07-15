import React, { useState } from "react";

export default function RegisterPage({ onBack }) {
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    role: "empleado",
    telefono: "",
    direccion: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (
      !form.nombre ||
      !form.apellidos ||
      !form.email ||
      !form.telefono ||
      !form.direccion ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    // Validación de email simple
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("El correo electrónico no es válido.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:6001/int/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          apellidos: form.apellidos,
          email: form.email,
          role: form.role,
          telefono: form.telefono,
          direccion: form.direccion,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al crear usuario");
        setLoading(false);
        return;
      }
      setSuccess("Usuario creado exitosamente. Ahora puedes iniciar sesión.");
      setForm({
        nombre: "",
        apellidos: "",
        email: "",
        role: "empleado",
        telefono: "",
        direccion: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center font-cursive text-primary">
        Crear usuario
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">Apellidos</label>
          <input
            type="text"
            name="apellidos"
            value={form.apellidos}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">Dirección</label>
          <input
            type="text"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">Rol</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          >
            <option value="empleado">Empleado</option>
            <option value="gerente">Gerente</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">Contraseña</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-semibold">Confirmar contraseña</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-secondary transition flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
          ) : null}
          Crear usuario
        </button>
        <button
          type="button"
          className="w-full mt-2 bg-gray-200 text-primary py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          onClick={onBack}
          disabled={loading}
        >
          Volver
        </button>
      </form>
    </div>
  );
}