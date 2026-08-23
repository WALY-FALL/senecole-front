import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/navbar.css";

const Navbar = () => {
  const [showSignupMenu, setShowSignupMenu] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  // Vérifie si l'utilisateur est connecté
  const isConnected = !!localStorage.getItem("token");

  // Déconnexion
  const handleLogout = () => {
    // Supprimer les informations de session
    localStorage.removeItem("token");
    localStorage.removeItem("eleveId");
    localStorage.removeItem("profId");
    localStorage.removeItem("classeId");

    // Supprimer les classes mémorisées par professeur
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("classe_")) {
        localStorage.removeItem(key);
      }
    });

    // Fermer le menu mobile
    setMobileOpen(false);

    // Fermer les menus
    setShowSignupMenu(false);
    setShowLoginMenu(false);

    // Retour à l'accueil
    navigate("/");
  };

  return (
    <div className="container-navbar">

      <p className="container-logo">
        Sèn École Virtuelle
      </p>

      {/* === HAMBURGER MOBILE === */}
      <div
        className="hamburger"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav className={`navbar ${mobileOpen ? "navbar-open" : ""}`}>

        {/* === HOME === */}
        <li>
          <Link
            className="li-link"
            to="/"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
        </li>

        {/* ================================= */}
        {/* UTILISATEUR NON CONNECTÉ */}
        {/* ================================= */}

        {!isConnected && (
          <>
            {/* === SIGNUP === */}
            <li
              className="dropdown"
              onMouseLeave={() => setShowSignupMenu(false)}
            >
              <span
                className="li-link dropdown-title"
                onClick={() => {
                  setShowSignupMenu(!showSignupMenu);
                  setShowLoginMenu(false);
                }}
              >
                S'inscrire ▾
              </span>

              <ul
                className={`dropdown-menu ${
                  showSignupMenu ? "show" : ""
                }`}
              >

                <li>
                  <Link
                    to="/signup-eleve"
                    className="dropdown-item"
                    onClick={() => {
                      setShowSignupMenu(false);
                      setMobileOpen(false);
                    }}
                  >
                    Élève
                  </Link>
                </li>

                <li>
                  <Link
                    to="/signup-prof"
                    className="dropdown-item"
                    onClick={() => {
                      setShowSignupMenu(false);
                      setMobileOpen(false);
                    }}
                  >
                    Professeur
                  </Link>
                </li>

              </ul>
            </li>

            {/* === LOGIN === */}
            <li
              className="dropdown"
              onMouseLeave={() => setShowLoginMenu(false)}
            >
              <span
                className="li-link dropdown-title"
                onClick={() => {
                  setShowLoginMenu(!showLoginMenu);
                  setShowSignupMenu(false);
                }}
              >
                Se connecter ▾
              </span>

              <ul
                className={`dropdown-menu ${
                  showLoginMenu ? "show" : ""
                }`}
              >

                <li>
                  <Link
                    to="/login-eleve"
                    className="dropdown-item"
                    onClick={() => {
                      setShowLoginMenu(false);
                      setMobileOpen(false);
                    }}
                  >
                    Élève
                  </Link>
                </li>

                <li>
                  <Link
                    to="/login-prof"
                    className="dropdown-item"
                    onClick={() => {
                      setShowLoginMenu(false);
                      setMobileOpen(false);
                    }}
                  >
                    Professeur
                  </Link>
                </li>

              </ul>
            </li>
          </>
        )}

        {/* ================================= */}
        {/* UTILISATEUR CONNECTÉ */}
        {/* ================================= */}

        {isConnected && (
          <li>
            <button
              className="li-link bouton-deconnexion"
              onClick={handleLogout}
            >
              🚪 Se déconnecter
            </button>
          </li>
        )}

      </nav>
    </div>
  );
};

export default Navbar;

/*import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../style/navbar.css";



const Navbar = () => {
  const [showSignupMenu, setShowSignupMenu] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="container-navbar">
      <p className="container-logo">Sèn École Virtuelle</p>*/

      {/* === HAMBURGER MOBILE === */}
      /*<div className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>*/
      {/*{(mobileOpen || window.innerWidth > 768) && (*/}
      /*<nav className={`navbar ${mobileOpen ? "navbar-open" : ""}`}>
        <li>
          <Link className="li-link" to="/" onClick={() => setMobileOpen(false)}>
            Home
          </Link>
        </li>*/

        {/* === SIGNUP === */}
       /* <li 
        className="dropdown" 
        onMouseLeave={() => setShowSignupMenu(false)}
        >
          <span
            className="li-link dropdown-title"
            onClick={() => {
              setShowSignupMenu(!showSignupMenu);
              setShowLoginMenu(false);} // ferme l'autre menu
            }
          >
            S'inscrire ▾
          </span>

          <ul className={`dropdown-menu ${showSignupMenu ? "show" : ""}`}>
            <li>
              <Link
                to="/signup-eleve"
                className="dropdown-item"
                onClick={() => {
                  setShowSignupMenu(false);
                  setMobileOpen(false);}
                }
              >
                Élève
              </Link>
            </li>
            <li>
              <Link
                to="/signup-prof"
                className="dropdown-item"
                onClick={() => {
                  setShowSignupMenu(false);
                  setMobileOpen(false);}
                }
              >
                Professeur
              </Link>
            </li>
          </ul>
        </li>*/

        {/* === LOGIN === */}
        /*<li 
        className="dropdown"
        onMouseLeave={() => setShowLoginMenu(false)}
        >
          <span
            className="li-link dropdown-title"
            onClick={() => {
              setShowLoginMenu(!showLoginMenu)
              setShowSignupMenu(false);} // ferme l'autre menu
            }
          >
            Se connecter ▾
          </span>

          <ul className={`dropdown-menu ${showLoginMenu ? "show" : ""}`}>
            <li>
              <Link
                to="/login-eleve"
                className="dropdown-item"
                onClick={() => {
                  setShowLoginMenu(false);
                  setMobileOpen(false);}
                }
              >
                Élève
              </Link>
            </li>
            <li>
              <Link
                to="/login-prof"
                className="dropdown-item"
                onClick={() => {
                  setShowLoginMenu(false);
                  setMobileOpen(false);}
                }
              >
                Professeur
              </Link>
            </li>
          </ul>
        </li>
      </nav>
    </div>
  );
};

export default Navbar;*/
