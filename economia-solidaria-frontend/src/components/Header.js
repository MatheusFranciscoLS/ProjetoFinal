import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FaStore, FaUserPlus, FaSignInAlt, FaPlus, FaBriefcase, 
         FaUserCog, FaCogs, FaSignOutAlt, FaUser, FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import "../styles/header.css";

const Header = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.tipo === "admin");
          }
        } catch (error) {
          console.error("Erro ao verificar o papel do usuário:", error);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  };

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link to={to} className="nav-link" onClick={() => setIsMenuOpen(false)}>
      <Icon className="nav-icon" />
      <span>{children}</span>
    </Link>
  );

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="logo-link">
        <img
          src={require("../assets/brabo.jpg")}
          alt="Economia Solidária"
          className="logo"
        />
        <span className="logo-text">Economia Solidária</span>
      </Link>

      <button 
        className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Menu"
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
        <div className="nav-links">
          <NavLink to="/lojas" icon={FaStore}>Lojas</NavLink>
          
          {!user && (
            <>
              <NavLink to="/register" icon={FaUserPlus}>Cadastro</NavLink>
              <NavLink to="/login" icon={FaSignInAlt}>Login</NavLink>
            </>
          )}

          {user && (
            <>
              <NavLink to="/register-business" icon={FaPlus}>Cadastrar Loja</NavLink>
              {user && !isAdmin && (
  <NavLink to="/meus-negocios" icon={FaBriefcase}>Meus Negócios</NavLink> // Only for non-admin users
)}

              {user && !isAdmin && (
  <NavLink to="/perfil" icon={FaUserCircle}>Perfil</NavLink> // Show only if user is not an admin
)}
            </>
          )}

          {isAdmin && (
            <>
              <NavLink to="/admin-dashboard" icon={FaUserCog}>Painel Admin</NavLink>
              <NavLink to="/admin-gerenciamento" icon={FaCogs}>Gerenciamento</NavLink>
            </>
          )}
        </div>

        {user && (
          <div className="user-section">
            <div className="user-info">
              <FaUser className="user-icon" />
              <span className="user-email">{user.email}</span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              <FaSignOutAlt />
              <span>Sair</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
