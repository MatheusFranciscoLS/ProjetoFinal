// src/pages/BusinessStatus.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";

const BusinessStatus = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchBusiness = async () => {
      const docRef = doc(db, "lojas", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBusiness(docSnap.data());
        setStatus(docSnap.data().status);
      }
    };
    fetchBusiness();
  }, [id]);

  const handleStatusChange = async () => {
    const docRef = doc(db, "lojas", id);
    await updateDoc(docRef, { status });
  };

  return (
    <div>
      <h2>Status do Negócio</h2>
      <p><strong>Nome:</strong> {business.nome}</p>
      <p><strong>Status:</strong> {status}</p>
      <div>
        <label>Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pendente">Pendente</option>
          <option value="aprovado">Aprovado</option>
          <option value="negado">Negado</option>
        </select>
      </div>
      <button onClick={handleStatusChange}>Atualizar Status</button>
    </div>
  );
};

export default BusinessStatus;
