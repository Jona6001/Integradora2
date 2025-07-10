import React, { useState } from "react";
import RegisterPage from "./RegisterPage";

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ usuario: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [tempPasswordUser, setTempPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.usuario === "" || form.password === "") {
      setError("Por favor, completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:6001/int/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.usuario,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error de autenticación");
        setLoading(false);
        return;
      }
      
      // 🔍 VERIFICAR SI EL USUARIO TIENE CONTRASEÑA TEMPORAL
      if (data.user.hasTemporaryPassword) {
        console.log('⚠️ Contraseña temporal detectada, mostrando pantalla de cambio');
        setTempPasswordUser(data.user);
        setShowChangePassword(true);
        setLoading(false);
        
        // 👇 MOSTRAR ALERTA INMEDIATA
        alert('⚠️ ATENCIÓN: Debes cambiar tu contraseña temporal antes de continuar por motivos de seguridad.');
        return;
      }
      
      // Login normal si no hay contraseña temporal
      localStorage.setItem("auth", "true");
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      if (onLogin) {
        onLogin(data.user, data.accessToken);
      } else {
        window.location.reload();
      }
      
    } catch (err) {
      setError("Error de conexión con el servidor.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage("");
    
    if (cooldown > 0) {
      setForgotPasswordMessage(`⏱️ Espera ${cooldown} segundos antes de enviar otro correo.`);
      return;
    }
    
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage("Por favor, ingresa tu correo electrónico.");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setForgotPasswordMessage("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    setForgotPasswordLoading(true);
    
    try {
      const res = await fetch("http://localhost:6001/int/user/recover-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // ✅ SOLO activar cooldown cuando el correo se envía exitosamente
        setForgotPasswordMessage("✅ Se ha enviado un correo con las instrucciones para recuperar tu contraseña.");
        startCooldown(); // 👈 SOLO se ejecuta cuando el envío es exitoso
      } else {
        // ❌ NO activar cooldown si hay error
        setForgotPasswordMessage(data.message || "Error al enviar el correo de recuperación.");
      }
    } catch (err) {
      // ❌ NO activar cooldown si hay error de conexión
      setForgotPasswordMessage("Error de conexión con el servidor.");
    }
    
    setForgotPasswordLoading(false);
  };

  const startCooldown = () => {
    setCooldown(5);
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordError("");
    
    if (!newPassword || !confirmPassword) {
      setChangePasswordError("Por favor, completa todos los campos.");
      return;
    }
    
    if (newPassword.length < 6) {
      setChangePasswordError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setChangePasswordError("Las contraseñas no coinciden.");
      return;
    }
    
    setChangePasswordLoading(true);
    
    try {
      const res = await fetch("http://localhost:6001/int/user/change-temp-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: tempPasswordUser._id,
          newPassword: newPassword
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Login exitoso después del cambio de contraseña
        localStorage.setItem("auth", "true");
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        alert("🎉 Contraseña cambiada exitosamente. Bienvenido!");
        
        if (onLogin) {
          onLogin(data.user, data.accessToken);
        } else {
          window.location.reload();
        }
      } else {
        setChangePasswordError(data.message || "Error al cambiar la contraseña.");
      }
    } catch (err) {
      setChangePasswordError("Error de conexión con el servidor.");
    }
    
    setChangePasswordLoading(false);
  };

  if (showRegister) {
    return <RegisterPage onBack={() => setShowRegister(false)} />;
  }

  if (showChangePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-3xl font-bold text-primary font-cursive">
              Cambiar Contraseña
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div className="flex items-start space-x-2">
                <div className="text-yellow-500 text-lg">⚠️</div>
                <div className="text-yellow-700 text-sm">
                  <p className="font-semibold mb-1">¡Contraseña Temporal Detectada!</p>
                  <p>Por seguridad, debes cambiar tu contraseña temporal antes de continuar.</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block mb-1 text-gray-700 font-semibold">
                🔒 Nueva Contraseña
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
                placeholder="Ingresa tu nueva contraseña"
                autoFocus
                disabled={changePasswordLoading}
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-semibold">
                🔒 Confirmar Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
                placeholder="Confirma tu nueva contraseña"
                disabled={changePasswordLoading}
              />
            </div>

            {changePasswordError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
                ⚠️ {changePasswordError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition flex items-center justify-center"
              disabled={changePasswordLoading}
            >
              {changePasswordLoading ? (
                <>
                  <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                  Cambiando contraseña...
                </>
              ) : (
                <>
                  🔄 Cambiar Contraseña
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Esta acción es obligatoria por seguridad
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-3xl font-bold text-primary font-cursive">
              Recuperar Contraseña
            </h2>
            <p className="text-gray-600 mt-2">
              Ingresa tu correo electrónico y te enviaremos las instrucciones para recuperar tu contraseña.
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label className="block mb-1 text-gray-700 font-semibold">
                📧 Correo Electrónico
              </label>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
                placeholder="tu@correo.com"
                autoFocus
                disabled={forgotPasswordLoading || cooldown > 0}
              />
            </div>

            {forgotPasswordMessage && (
              <div className={`p-4 rounded-lg text-sm ${
                forgotPasswordMessage.includes('✅') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : forgotPasswordMessage.includes('⏱️')
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {forgotPasswordMessage}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center ${
                cooldown > 0 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-secondary'
              }`}
              disabled={forgotPasswordLoading || cooldown > 0}
            >
              {forgotPasswordLoading ? (
                <>
                  <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                  Enviando...
                </>
              ) : cooldown > 0 ? (
                <>
                  ⏱️ Espera {cooldown} segundos
                </>
              ) : (
                <>
                  📨 Enviar Correo de Recuperación
                </>
              )}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                className="text-primary hover:text-secondary font-semibold transition"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                  setForgotPasswordMessage("");
                  setCooldown(0);
                }}
                disabled={forgotPasswordLoading}
              >
                ← Volver al inicio de sesión
              </button>
            </div>
          </form>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <div className="text-blue-500 text-lg">💡</div>
              <div className="text-blue-700 text-sm">
                <p className="font-semibold mb-1">¿No recibes el correo?</p>
                <ul className="text-xs space-y-1">
                  <li>• Revisa tu carpeta de spam</li>
                  <li>• Verifica que el correo sea correcto</li>
                  <li>• Contacta al administrador si persiste el problema</li>
                  <li>• Solo se activa el cooldown cuando el envío es exitoso</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🌮</div>
          <h2 className="text-3xl font-bold text-primary font-cursive">
            Lonches El Primo
          </h2>
          <p className="text-gray-600 mt-2">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-gray-700 font-semibold">
              👤 Usuario
            </label>
            <input
              type="text"
              name="usuario"
              value={form.usuario}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
              placeholder="Nombre de usuario"
              autoFocus
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block mb-1 text-gray-700 font-semibold">
              🔒 Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
              placeholder="Tu contraseña"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                Iniciando sesión...
              </>
            ) : (
              <>
                🚀 Iniciar sesión
              </>
            )}
          </button>

          <div className="text-center space-y-2">
            <button
              type="button"
              className="text-primary hover:text-secondary font-semibold transition text-sm"
              onClick={() => setShowForgotPassword(true)}
              disabled={loading}
            >
              🔑 ¿Olvidaste tu contraseña?
            </button>
            
            <div className="border-t pt-4">
              <button
                type="button"
                className="w-full bg-gray-100 text-primary py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                onClick={() => setShowRegister(true)}
                disabled={loading}
              >
                👨‍💼 Crear nueva cuenta
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}