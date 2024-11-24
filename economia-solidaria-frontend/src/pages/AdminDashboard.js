import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc, deleteDoc, setDoc } from "firebase/firestore"; // Adicionando getDoc na importação
import { db } from "../firebase"; // Certifique-se de importar o 'db'

const AdminDashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => {
    const fetchPendingBusinesses = async () => {
      try {
        const q = query(collection(db, "negocios_pendentes"), where("status", "==", "pendente"));
        const querySnapshot = await getDocs(q);
        const businessesList = [];
        querySnapshot.forEach((doc) => {
          businessesList.push({ ...doc.data(), id: doc.id });
        });
        setBusinesses(businessesList);
      } catch (err) {
        console.error("Erro ao buscar negócios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBusinesses();
  }, []);

  const handleApproval = async (businessId, approved) => {
    try {
      const businessRef = doc(db, "negocios_pendentes", businessId);
      const businessSnapshot = await getDoc(businessRef);

      if (businessSnapshot.exists()) {
        const businessData = businessSnapshot.data();

        // Atualiza o status do negócio
        await setDoc(businessRef, {
          ...businessData,
          status: approved ? "aprovado" : "negado", // Atualiza o status para "aprovado" ou "negado"
        });

        // Se aprovado, move o negócio da coleção "negocios_pendentes" para "lojas"
        if (approved) {
          const newBusinessRef = doc(db, "lojas", businessId);
          await setDoc(newBusinessRef, {
            ...businessData,
            status: "aprovado", // Adiciona o status aprovado na coleção "lojas"
          });

          // Remove o negócio da coleção de pendentes
          await deleteDoc(businessRef);
          console.log("Negócio aprovado e movido para 'lojas'.");
        } else {
          console.log("Negócio negado.");
        }

        // Remove o negócio da lista visível após aprovação ou negação
        setBusinesses(businesses.filter((business) => business.id !== businessId));
      } else {
        console.error("Negócio não encontrado!");
      }
    } catch (err) {
      console.error("Erro ao atualizar status do negócio:", err);
    }
  };

  const handleViewDetails = async (businessId) => {
    const businessRef = doc(db, "negocios_pendentes", businessId);
    const businessSnapshot = await getDoc(businessRef);

    if (businessSnapshot.exists()) {
      setSelectedBusiness(businessSnapshot.data());
    } else {
      console.error("Negócio não encontrado!");
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Cadastro de Negócios Pendentes</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div>
          {businesses.length === 0 ? (
            <p>Nenhum negócio pendente para aprovação.</p>
          ) : (
            <ul>
              {businesses.map((business) => (
                <li key={business.id}>
                  <h3>{business.nome}</h3>
                  <p>{business.descricao}</p>
                  <p>Status: {business.status}</p>
                  <button onClick={() => handleViewDetails(business.id)}>Ver Detalhes</button>
                  <button onClick={() => handleApproval(business.id, true)}>Aprovar</button>
                  <button onClick={() => handleApproval(business.id, false)}>Negar</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedBusiness && (
        <div className="business-details">
          <h2>Detalhes do Negócio</h2>
          <p><strong>Nome:</strong> {selectedBusiness.nome}</p>
          <p><strong>Descrição:</strong> {selectedBusiness.descricao}</p>
          <p><strong>Categoria:</strong> {selectedBusiness.categoria}</p>
          <p><strong>Endereço:</strong> {selectedBusiness.endereco}</p>
          <p><strong>Telefone:</strong> {selectedBusiness.telefone}</p>
          <p><strong>E-mail:</strong> {selectedBusiness.email}</p>
          <p><strong>Horários de Funcionamento:</strong> {selectedBusiness.horarioDeFuncionamento}</p>

          <div>
            <strong>Imagens do Negócio:</strong>
            <div className="business-images">
              {selectedBusiness.imagens?.map((img, index) => (
                <img key={index} src={img} alt={`Imagem ${index + 1}`} />
              ))}
            </div>
          </div>

          <div>
            <strong>Comprovante do Simples Nacional:</strong>
            {selectedBusiness.comprovante && (
              <a href={`data:application/pdf;base64,${selectedBusiness.comprovante}`} target="_blank" rel="noopener noreferrer">
                Visualizar Comprovante
              </a>
            )}
          </div>

          <div>
            <button onClick={() => handleApproval(selectedBusiness.id, true)}>Aprovar</button>
            <button onClick={() => handleApproval(selectedBusiness.id, false)}>Negar</button>
            <button onClick={() => setSelectedBusiness(null)}>Fechar Detalhes</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
