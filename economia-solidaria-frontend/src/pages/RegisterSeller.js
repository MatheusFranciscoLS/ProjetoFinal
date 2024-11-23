import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // Certifique-se de importar corretamente o db
import { useNavigate } from "react-router-dom"; // Para redirecionar o usuário após o cadastro

const CadastrarLoja = () => {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState(null); // Para armazenar a foto da loja
  const [endereco, setEndereco] = useState(""); // Para armazenar o endereço
  const navigate = useNavigate(); // Para redirecionar após o cadastro

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(URL.createObjectURL(file)); // Exibe uma prévia da foto
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Criação do documento na coleção "lojas" do Firebase
      const docRef = await addDoc(collection(db, "lojas"), {
        nome,
        descricao,
        endereco,
        foto,
      });

      alert("Loja cadastrada com sucesso!");
      // Redireciona para a página da loja após o cadastro
      navigate(`/loja/${docRef.id}`);
    } catch (error) {
      console.error("Erro ao cadastrar loja:", error);
    }
  };

  return (
    <div>
      <h2>Cadastrar Loja</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          placeholder="Nome da Loja"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFotoChange}
        />
        {foto && <img src={foto} alt="Foto da Loja" style={{ width: "100px", height: "100px" }} />}
        <button type="submit">Cadastrar Loja</button>
      </form>
    </div>
  );
};

export default CadastrarLoja;
