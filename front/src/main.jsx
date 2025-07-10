import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import "./index.css";
// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const isAuth = localStorage.getItem("auth") === "true";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isAuth ? <App /> : <LoginPage />}
  </React.StrictMode>
);
