import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import { Google } from "@mui/icons-material";
import "../styles/auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  useEffect(() => {
    setError("");
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin(e);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      navigate("/");
    } catch (err) {
      console.error("Erro no login:", err);
      switch (err.code) {
        case "auth/invalid-email":
          setError("Email inválido");
          break;
        case "auth/user-disabled":
          setError("Esta conta foi desativada");
          break;
        case "auth/user-not-found":
          setError("Usuário não encontrado");
          break;
        case "auth/wrong-password":
          setError("Senha incorreta");
          break;
        default:
          setError("Erro ao fazer login. Por favor, tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const resultado = await signInWithPopup(auth, provider);
      const usuario = resultado.user;

      // Verifica se o usuário existe no Firestore
      const usuarioDocRef = doc(db, 'users', usuario.uid);
      const usuarioDoc = await getDoc(usuarioDocRef);

      if (!usuarioDoc.exists()) {
        // Criar documento inicial do usuário com dados do Google
        await setDoc(usuarioDocRef, {
          name: usuario.displayName || "Não informado",
          email: usuario.email,
          phone: "Não informado",
          address: "Não informado",
          currentPlan: "Não especificado",
          tipo: "comum",
          createdAt: new Date().toISOString(),
          role: "user",
          photoURL: usuario.photoURL || "",
          lastLogin: new Date().toISOString()
        });
        // Redireciona para home
        navigate('/');
      } else {
        // Verifica se todos os campos obrigatórios estão preenchidos
        const dadosUsuario = usuarioDoc.data();
        const camposObrigatorios = ['name', 'email', 'phone', 'address'];
        const temCamposNaoInformados = camposObrigatorios.some(campo => 
          !dadosUsuario[campo] || 
          dadosUsuario[campo] === "Não informado" || 
          dadosUsuario[campo] === "Não especificado"
        );

        // Atualiza o lastLogin
        await setDoc(usuarioDocRef, {
          lastLogin: new Date().toISOString()
        }, { merge: true });

        if (temCamposNaoInformados) {
          // Dados incompletos, redireciona para completar o cadastro
          navigate('/');
        } else {
          // Usuário completo, redireciona para página inicial
          navigate('/');
        }
      }
    } catch (err) {
      setError("Erro ao fazer login com Google: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <h2>Login</h2>
        {message && (
          <div className="info-message">
            <FiAlertCircle size={20} />
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Seu email"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Sua senha"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <p className="error-message">
              <FiAlertCircle />
              {error}
            </p>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="google-login">
            <button
              onClick={handleGoogleLogin}
              className="btn-google-register"
              disabled={loading}
            >
              <Google />
              {loading ? "Conectando..." : "Entrar com Google"}
            </button>
          </div>

          <p className="auth-link">
            Não tem uma conta? <Link to="/register">Registre-se</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
