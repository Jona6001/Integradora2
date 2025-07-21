import Logo from "../../assets/website/logo.jpg";
import { FaCoffee } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import PropTypes from "prop-types";

const Menu = [
  {
    id: 1,
    name: "Home",
    link: "/#",
  },
  {
    id: 2,
    name: "Services",
    link: "/#services",
  },
  {
    id: 3,
    name: "About",
    link: "/#about",
  },
];

const Navbar = ({ onShowUserMenu, puedeCrearUsuario, onCrearUsuario }) => {
  return (
    <>
      <div className="bg-gradient-to-r from-secondary to-secondary/90 shadow-md bg-gray-900 text-white">
        <div className="container py-2">
          <div className="flex justify-between items-center">
            {/* Logo section */}
            <div data-aos="fade-down" data-aos-once="true">
              <a
                href="#"
                className="font-bold text-2xl sm:text-3xl flex justify-center items-center gap-2 tracking-wider font-cursive"
              >
                <img src={Logo} alt="Logo" className="w-14" />
                Lonches El Primo
              </a>
            </div>

            {/* Link section */}
            <div
              data-aos="fade-down"
              data-aos-once="true"
              data-aos-delay="300"
              className="flex justify-between items-center gap-4"
            >
              <ul className="hidden sm:flex items-center gap-4">
                {Menu.map((menu) => (
                  <li key={menu.id}>
                    <a
                      href={menu.link}
                      className="inline-block text-xl py-4 px-4 text-white/70 hover:text-white duration-200"
                    >
                      {menu.name}
                    </a>
                  </li>
                ))}
                {/* Botón Crear usuario solo para gerente o administrador */}
                {puedeCrearUsuario && (
                  <li>
                    <button
                      className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-secondary transition ml-2"
                      onClick={onCrearUsuario}
                      type="button"
                    >
                      Crear usuario
                    </button>
                  </li>
                )}
              </ul>
              <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition ml-2"
                  onClick={() => {
                    localStorage.removeItem("auth");
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    window.location.reload();
                  }}
                  type="button">
                  Cerrar sesión
              </button>
              <button className="bg-primary/70 hover:scale-105 duration-200 text-white px-4 py-2 rounded-full flex items-center gap-3">
                Order
                <FaCoffee className="text-xl text-white drop-shadow-sm cursor-pointer" />
              </button>
              <button
                    className="bg-primary/70 hover:scale-105 duration-200 text-white px-4 py-2 rounded-full flex items-center gap-2"
                    onClick={onShowUserMenu}>
                    <FaUserCircle className="text-xl" />
                    Usuario
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
Navbar.propTypes = {
  onShowUserMenu: PropTypes.func.isRequired,
  puedeCrearUsuario: PropTypes.bool,
  onCrearUsuario: PropTypes.func,
};

export default Navbar;
