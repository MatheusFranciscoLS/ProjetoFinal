import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FiUser, FiMail, FiLock, FiPhone, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import InputMask from "react-input-mask";
import "../styles/auth.css";
import { Google } from "@mui/icons-material";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cellphone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const nameInput = document.getElementById("name");
    if (nameInput) nameInput.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value.trim()
    }));
    setError("");
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = formData.phone.replace(/\D/g, "");
    const cellphoneDigits = formData.cellphone.replace(/\D/g, "");

    if (!formData.name || formData.name.length < 3) {
      setError("O nome deve ter pelo menos 3 caracteres");
      return false;
    }

    if (!formData.email || !emailRegex.test(formData.email)) {
      setError("Por favor, insira um email válido");
      return false;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return false;
    }

    if ((phoneDigits.length === 0 && cellphoneDigits.length === 0) ||
        (phoneDigits.length !== 10 && cellphoneDigits.length !== 11)) {
      setError("Por favor, insira um número de telefone ou celular válido");
      return false;
    }

    if (!formData.acceptTerms) {
      setError("Você deve aceitar os termos e condições para continuar");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = userCredential.user.uid;

      const usuarioDocRef = doc(db, "users", uid);
      await setDoc(usuarioDocRef, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cellphone: formData.cellphone,
        tipo: "comum",
        createdAt: new Date().toISOString(),
        role: "user"
      });

      setSuccess("Cadastro completo! Redirecionando...");
      setTimeout(() => {
        navigate("/business-question", { 
          state: { message: "Registro concluído! Responda algumas perguntas para continuar." }
        });
      }, 1500);
    } catch (err) {
      console.error("Erro ao registrar usuário:", err);
      setError("Erro ao registrar. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const usuarioDocRef = doc(db, "users", user.uid);
      const usuarioDoc = await getDoc(usuarioDocRef);

      if (!usuarioDoc.exists()) {
        setSuccess("Conta Google vinculada! Por favor, complete seu cadastro.");
      } else {
        const dadosUsuario = usuarioDoc.data();
        setFormData((prev) => ({
          ...prev,
          name: dadosUsuario.name || user.displayName || "",
          email: dadosUsuario.email || user.email || "",
          phone: dadosUsuario.phone || "",
          cellphone: dadosUsuario.cellphone || "",
        }));

        setSuccess("Conta Google encontrada! Verifique e complete seus dados.");
      }
    } catch (err) {
      setError("Erro ao entrar com Google: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <h2>Cadastro</h2>

        <button
          onClick={handleGoogleSignIn}
          className="btn-google-register"
          disabled={loading}
        >
          <Google />
          {loading ? "Conectando..." : "Continuar com Google"}
        </button>

        <div className="divider">
          <span>ou</span>
        </div>

        {success && (
          <div className="success-message">
            <FiCheckCircle />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nome Completo</label>
            <div className="input-with-icon">
              <FiUser className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                autoComplete="name"
                required
                disabled={loading}
              />
            </div>
          </div>

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
                placeholder="Seu melhor email"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefone</label>
            <InputMask
              mask="(99) 9999-9999"
              maskChar={null}
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-control"
              placeholder="(XX) XXXX-XXXX"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cellphone">Celular</label>
            <InputMask
              mask="(99) 99999-9999"
              maskChar={null}
              type="text"
              id="cellphone"
              name="cellphone"
              value={formData.cellphone}
              onChange={handleChange}
              className="form-control"
              placeholder="(XX) XXXXX-XXXX"
              disabled={loading}
            />
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
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Digite a senha novamente"
                autoComplete="new-password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                disabled={loading}
              />
              <span>
                Li e aceito os <Link to="/terms" target="_blank">termos de uso</Link>
              </span>
            </label>
          </div>

          {error && (
            <p className="error-message">
              <FiAlertCircle />
              {error}
            </p>
          )}

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>

          <p className="auth-link">
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
