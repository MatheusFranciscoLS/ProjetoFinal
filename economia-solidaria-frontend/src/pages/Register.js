import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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
    // Adicionar mensagens de feedback ao usuário
    const showFeedback = (field, message) => {
      const feedbackElement = document.getElementById(`${field}-feedback`);
      if (feedbackElement) {
        feedbackElement.innerText = message;
        feedbackElement.style.color = message.includes("válido") ? 'green' : 'red';
      }
    };

    // Validação do nome
    if (!formData.name) {
      setError("Por favor, insira seu nome completo");
      showFeedback("name", "Nome é obrigatório.");
      document.getElementById("name").focus();
      return false;
    }

    if (formData.name.length < 3) {
      setError("O nome deve ter pelo menos 3 caracteres");
      showFeedback("name", "O nome deve ter pelo menos 3 caracteres.");
      document.getElementById("name").focus();
      return false;
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setError("Por favor, insira um email válido");
      showFeedback("email", "Email inválido.");
      document.getElementById("email").focus();
      return false;
    }

    // Validação da senha
    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      showFeedback("password", "A senha deve ter pelo menos 6 caracteres.");
      document.getElementById("password").focus();
      return false;
    }

    // Validação da confirmação de senha
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      document.getElementById("confirmPassword").focus();
      return false;
    }

    // Validação de telefone ou celular
    const phoneDigits = formData.phone.replace(/\D/g, "");
    const cellphoneDigits = formData.cellphone.replace(/\D/g, "");
    if ((phoneDigits.length === 0 && cellphoneDigits.length === 0) ||
        (phoneDigits.length !== 10 && cellphoneDigits.length !== 11)) {
      setError("Por favor, insira um número de telefone ou celular válido.");
      showFeedback("phone", "O número de telefone deve conter 10 dígitos.");
      showFeedback("cellphone", "O número de celular deve conter 11 dígitos.");
      if (phoneDigits.length === 0) {
        document.getElementById("phone").focus();
      } else {
        document.getElementById("cellphone").focus();
      }
      return false;
    }

    // Validação de aceitação dos termos
    if (!formData.acceptTerms) {
      setError("Você deve aceitar os termos e condições para continuar.");
      showFeedback("acceptTerms", "Aceitação dos termos é obrigatória.");
      document.getElementById("acceptTerms").focus();
      return false;
    }

    // Feedback visual para campos preenchidos corretamente
    if (formData.name) {
      document.getElementById("name").classList.add("valid-input");
    } else {
      document.getElementById("name").classList.remove("valid-input");
    }

    if (formData.email && emailRegex.test(formData.email)) {
      document.getElementById("email").classList.add("valid-input");
    } else {
      document.getElementById("email").classList.remove("valid-input");
    }

    if (phoneDigits.length === 10 || cellphoneDigits.length === 11) {
      document.getElementById("phone").classList.add("valid-input");
      document.getElementById("cellphone").classList.add("valid-input");
    } else {
      document.getElementById("phone").classList.remove("valid-input");
      document.getElementById("cellphone").classList.remove("valid-input");
    }

    if (formData.password.length >= 6) {
      document.getElementById("password").classList.add("valid-input");
    } else {
      document.getElementById("password").classList.remove("valid-input");
    }

    if (formData.confirmPassword && formData.password === formData.confirmPassword) {
      document.getElementById("confirmPassword").classList.add("valid-input");
    } else {
      document.getElementById("confirmPassword").classList.remove("valid-input");
    }

    if (formData.acceptTerms) {
      document.getElementById("acceptTerms").classList.add("valid-input");
    } else {
      document.getElementById("acceptTerms").classList.remove("valid-input");
    }

    showFeedback("password", formData.password.length >= 6 ? "Senha válida." : "A senha deve ter pelo menos 6 caracteres.");
    showFeedback("confirmPassword", formData.password === formData.confirmPassword ? "Senhas coincidem." : "As senhas não coincidem.");

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
        cellphone: formData.cellphone,
        tipo:"comum",
        createdAt: new Date().toISOString(),
        role: "user"
      });

      setSuccess("Conta criada com sucesso! Redirecionando...");
      
      // Aguarda 1.5 segundos antes de redirecionar
      setTimeout(() => {
        navigate("/business-question", { 
          state: { message: "Registro concluído! Responda algumas perguntas para continuar." }
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

  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Salvar dados do usuário no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });

      console.log('Usuário registrado com sucesso:', user);
    } catch (error) {
      console.error('Erro ao fazer login com o Google:', error);
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
              <p id="name-feedback"></p>
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
              <p id="email-feedback"></p>
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
            <p id="phone-feedback"></p>
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
            <p id="cellphone-feedback"></p>
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
              <p id="password-feedback"></p>
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
              <p id="confirmPassword-feedback"></p>
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
            <p id="acceptTerms-feedback"></p>
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

          <button
            onClick={handleGoogleSignIn}
            className="btn-google-register"
            disabled={loading}
          >
            <Google />
            {loading ? "Conectando..." : "Entrar com Google"}
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