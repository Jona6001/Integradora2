import { useState } from "react";
import RegisterPage from "./RegisterPage";
import chems from "../assets/website/logo.jpeg";
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaSignInAlt, FaKey, FaArrowLeft } from "react-icons/fa";
import { MdOutlinePassword } from "react-icons/md";
import PropTypes from "prop-types";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

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
      const res = await fetch(`${API_URL}/int/user/login`, {
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

      // Verificar si el usuario tiene contraseña temporal
      if (data.hasTemporaryPassword) {
        setTempPasswordUser(data.user);
        setShowChangePassword(true);
        setLoading(false);
        alert('⚠️ ATENCIÓN: Debes cambiar tu contraseña temporal antes de continuar por motivos de seguridad.');
        return;
      }

      // Login normal si no hay contraseña temporal
      localStorage.setItem("auth", "true");
      localStorage.setItem("accessToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (onLogin) {
        onLogin(data.user, data.token);
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("Error en el inicio de sesión:", err);
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
      const res = await fetch(`${API_URL}/int/user/recover-pass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setForgotPasswordMessage("✅ Se ha enviado un correo con las instrucciones para recuperar tu contraseña.");
        startCooldown();
      } else {
        setForgotPasswordMessage(data.message || "Error al enviar el correo de recuperación.");
      }
    } catch (err) {
      console.error("Error en recuperación de contraseña:", err);
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

  // Cambiar contraseña temporal (NO pedir email, usar tempPasswordUser.email)
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
      const res = await fetch(`${API_URL}/int/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tempPasswordUser?.email,
          newPassword: newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Iniciar sesión automáticamente después de cambiar la contraseña
        const loginRes = await fetch(`${API_URL}/int/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: tempPasswordUser?.nombre,
            password: newPassword,
          }),
        });
        const loginData = await loginRes.json();

        if (loginRes.ok) {
          localStorage.setItem("auth", "true");
          localStorage.setItem("accessToken", loginData.token);
          localStorage.setItem("user", JSON.stringify(loginData.user));
          if (onLogin) {
            onLogin(loginData.user, loginData.token);
          } else {
            window.location.reload();
          }
        } else {
          alert("Contraseña cambiada, pero hubo un error al iniciar sesión automáticamente. Intenta iniciar sesión manualmente.");
          setShowChangePassword(false);
          setShowForgotPassword(false);
        }
        setForgotPasswordEmail("");
        setNewPassword("");
        setConfirmPassword("");
        setTempPasswordUser(null);
      } else {
        setChangePasswordError(data.message || "Error al cambiar la contraseña.");
      }
    } catch (err) {
      console.error("Error al cambiar la contraseña:", err);
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
            <div className="text-6xl mb-4 text-yellow-500 flex justify-center"><MdOutlinePassword /></div>
            <h2 className="text-3xl font-bold text-primary font-cursive flex items-center justify-center gap-2">
              <FaKey className="inline mb-1" /> Cambiar Contraseña
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
              <label className="block mb-1 text-gray-700 font-semibold flex items-center gap-2">
                <FaEnvelope /> Correo Electrónico
              </label>
              <input
                type="email"
                value={tempPasswordUser?.email || ""}
                readOnly
                disabled
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 border-gray-300"
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-700 font-semibold flex items-center gap-2">
                <FaLock /> Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
                  placeholder="Nueva contraseña"
                  disabled={changePasswordLoading}
                />
                <button
                  type="button"
                  className="btn-password-toggle absolute right-3 top-2 -translate-y-1.3 focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowNewPassword((v) => !v)}
                  aria-label="Mostrar/Ocultar contraseña"
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>
            <div>
              <label className="block mb-1 text-gray-700 font-semibold flex items-center gap-2">
                <FaLock /> Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300"
                  placeholder="Confirma tu nueva contraseña"
                  disabled={changePasswordLoading}
                />
                <button
                  type="button"
                  className="btn-password-toggle absolute right-3 top-2 -translate-y-1.3 focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label="Mostrar/Ocultar contraseña"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {changePasswordError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
                ⚠️ {changePasswordError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition flex items-center justify-center gap-2"
              disabled={changePasswordLoading}
            >
              {changePasswordLoading ? (
                <>
                  <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>{" "}
                  Cambiando contraseña...
                </>
              ) : (
                <>
                  <FaKey /> Cambiar Contraseña
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
    let buttonContent;
    if (forgotPasswordLoading) {
      buttonContent = (
        <>
          <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>{" "}
          Enviando...
        </>
      );
    } else if (cooldown > 0) {
      buttonContent = (
        <>
          ⏱️ Espera {cooldown} segundos
        </>
      );
    } else {
      buttonContent = (
        <>
          <FaEnvelope /> Enviar Correo de Recuperación
        </>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4 text-blue-500 flex justify-center"><FaEnvelope /></div>
            <h2 className="text-3xl font-bold text-primary font-cursive flex items-center justify-center gap-2">
              <FaKey className="inline mb-1" /> Recuperar Contraseña
            </h2>
            <p className="text-gray-600 mt-2">
              Ingresa tu correo electrónico y te enviaremos las instrucciones para recuperar tu contraseña.
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label className="block mb-1 text-gray-700 font-semibold flex items-center gap-2">
                <FaEnvelope /> Correo Electrónico
              </label>
            <input
              type="email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300
                bg-white text-black placeholder-gray-500`}
              placeholder="tu@correo.com"
              autoFocus
              disabled={forgotPasswordLoading || cooldown > 0}
            />
            </div>
            {forgotPasswordMessage && (() => {
              let messageClass = '';
              if (forgotPasswordMessage.includes('✅')) {
                messageClass = 'bg-green-50 text-green-700 border border-green-200';
              } else if (forgotPasswordMessage.includes('⏱️')) {
                messageClass = 'bg-yellow-50 text-yellow-700 border border-yellow-200';
              } else {
                messageClass = 'bg-red-50 text-red-700 border border-red-200';
              }
              return (
                <div className={`p-4 rounded-lg text-sm ${messageClass}`}>
                  {forgotPasswordMessage}
                </div>
              );
            })()}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                cooldown > 0 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-secondary'
              }`}
              disabled={forgotPasswordLoading || cooldown > 0}
            >
              {buttonContent}
            </button>
            <div className="text-center space-y-2">
              <button
                type="button"
                className="text-primary hover:text-secondary font-semibold transition flex items-center gap-2"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                  setForgotPasswordMessage("");
                  setCooldown(0);
                }}
                disabled={forgotPasswordLoading}
              >
                <FaArrowLeft /> Volver al inicio de sesión
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

 // --- LOGIN PRINCIPAL ---
return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-50 h-40 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-lg mx-auto border-4 border-primary">
            <img src={chems} alt="Logo Lonches El Primo" className="object-cover w-full h-full" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-primary font-cursive flex items-center justify-center gap-2">
           El Primo Lonches
        </h2>
        <p className="text-gray-600 mt-2 flex items-center justify-center gap-2">
          <FaSignInAlt /> Inicia sesión en tu cuenta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 text-gray-700 font-semibold flex items-center gap-2">
            <FaUser /> Usuario
          </label>
          <input
            type="text"
            name="usuario"
            value={form.usuario}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300
              bg-white text-black placeholder-gray-500`}
            placeholder="Nombre de usuario"
            autoFocus
            disabled={loading}
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700 font-semibold flex items-center gap-2">
            <FaLock /> Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-gray-300
                bg-white text-black placeholder-gray-500`}
              placeholder="Tu contraseña"
              disabled={loading}
            />
            <button
              type="button"
              className="btn-password-toggle absolute right-3 top-2 -translate-y-1.3 focus:outline-none"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Mostrar/Ocultar contraseña"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200 flex items-center gap-2">
            <MdOutlinePassword className="text-xl" /> {error}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>{" "}
              Iniciando sesión...
            </>
          ) : (
            <>
              <FaSignInAlt /> Iniciar sesión
            </>
          )}
        </button>
        <div className="text-center space-y-2">
          <button
            type="button"
            className="text-primary hover:text-secondary font-semibold transition text-sm flex items-center gap-2 mx-auto"
            onClick={() => setShowForgotPassword(true)}
            disabled={loading}
          >
            <FaKey /> ¿Olvidaste tu contraseña?
          </button>
        </div>
      </form>
    </div>
  </div>
);
}

LoginPage.propTypes = {
  onLogin: PropTypes.func,
};