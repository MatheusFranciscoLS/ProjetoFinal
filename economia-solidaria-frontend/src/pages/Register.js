import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { FiUser, FiMail, FiLock, FiPhone, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import InputMask from "react-input-mask";
import "../styles/auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Foca no campo de nome quando o componente carrega
    const nameInput = document.getElementById("name");
    if (nameInput) nameInput.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value.trim()
    }));
    setError("");
  };

  const validateForm = () => {
    // Validação do nome
    if (!formData.name) {
      setError("Por favor, insira seu nome completo");
      document.getElementById("name").focus();
      return false;
    }

    if (formData.name.length < 3) {
      setError("O nome deve ter pelo menos 3 caracteres");
      document.getElementById("name").focus();
      return false;
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setError("Por favor, insira um email válido");
      document.getElementById("email").focus();
      return false;
    }

    // Validação do telefone
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 11) {
      setError("Por favor, insira um número de telefone válido");
      document.getElementById("phone").focus();
      return false;
    }

    // Validação da senha
    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      document.getElementById("password").focus();
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      document.getElementById("confirmPassword").focus();
      return false;
    }

    // Validação dos termos
    if (!formData.acceptTerms) {
      setError("Você precisa aceitar os termos de uso");
      document.getElementById("acceptTerms").focus();
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
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Criar documento do usuário no Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date().toISOString(),
        role: "user"
      });

      setSuccess("Conta criada com sucesso! Redirecionando...");
      
      // Aguarda 1.5 segundos antes de redirecionar
      setTimeout(() => {
        navigate("/login", { 
          state: { message: "Registro concluído! Faça login para continuar." }
        });
      }, 1500);

    } catch (err) {
      console.error("Erro no registro:", err);
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Este email já está em uso. Tente fazer login.");
          document.getElementById("email").focus();
          break;
        case "auth/invalid-email":
          setError("Email inválido. Verifique o formato do email.");
          document.getElementById("email").focus();
          break;
        case "auth/operation-not-allowed":
          setError("O registro está temporariamente desabilitado.");
          break;
        case "auth/weak-password":
          setError("A senha é muito fraca. Use pelo menos 6 caracteres.");
          document.getElementById("password").focus();
          break;
        default:
          setError("Erro ao criar conta. Por favor, tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.type !== 'textarea') {
      e.preventDefault();
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      form.elements[index + 1].focus();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <h2>Criar Conta</h2>
        
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
                onKeyPress={handleKeyPress}
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
                onKeyPress={handleKeyPress}
                placeholder="Seu melhor email"
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefone</label>
            <div className="input-with-icon">
              <FiPhone className="input-icon" />
              <InputMask
                mask="(99) 99999-9999"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="(XX) XXXXX-XXXX"
                className="masked-input"
                autoComplete="tel"
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
                onKeyPress={handleKeyPress}
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

          {success && (
            <p className="success-message">
              <FiCheckCircle />
              {success}
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