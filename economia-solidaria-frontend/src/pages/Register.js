import React, { useState } from "react";
import InputMask from "react-input-mask"; // Importando o React Input Mask
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase"; // Certifique-se de exportar o db do Firebase
import { useNavigate } from "react-router-dom"; // Hook de navegação
import { doc, setDoc } from "firebase/firestore"; // Importando o Firestore
import "../styles/auth.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook de navegação

  const validateFields = () => {
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }
    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/; // Valida o formato com a máscara
    if (!phoneRegex.test(phone)) {
      setError("Digite um telefone válido no formato (XX) XXXXX-XXXX.");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Resetar erro antes de validar

    if (!validateFields()) return;

    try {
      // Cadastro no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user; // Obter o usuário autenticado

      // Salvar os dados do usuário no Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        nome: name,
        phone: phone.replace(/[^\d]/g, ""), // Armazena apenas os números no banco
        address: address || "", // Caso o endereço não seja informado, será salvo como string vazia
        tipo: "comum", // Inicialmente, o tipo será "comum"
        plano: "gratuito", // Adicionando o plano padrão como "gratuito"
      });

      // Usuário cadastrado com sucesso
      alert("Cadastro realizado com sucesso!");

      // Após o cadastro, redireciona para a nova página
      navigate("/business-question"); // Redireciona para a página de perguntas
    } catch (err) {
      setError(err.message); // Exibir mensagem de erro do Firebase
    }
  };

  return (
    <div className="auth-container">
      <h2>Cadastro</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nome Completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <InputMask
          mask="(99) 99999-9999" // Máscara para telefone celular
          placeholder="Telefone (somente números)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Endereço (Opcional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default Register;