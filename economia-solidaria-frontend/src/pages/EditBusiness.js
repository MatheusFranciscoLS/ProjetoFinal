import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const EditarLoja = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const fetchLoja = async () => {
      try {
        const docRef = doc(db, "lojas", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setForm(docSnap.data());
        } else {
          console.log("Loja não encontrada.");
        }
      } catch (error) {
        console.error("Erro ao carregar loja:", error);
      }
    };

    fetchLoja();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "lojas", id);
      await updateDoc(docRef, form);
      setMensagem("Loja atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar loja:", error);
      setMensagem("Erro ao atualizar loja. Tente novamente.");
    }
  };

  if (!form) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      <h2>Editar Loja</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          required
        />
        <textarea
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          required
        />
        {/* Adicione os outros campos aqui */}
        <button type="submit">Salvar Alterações</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
};

export default EditarLoja;
