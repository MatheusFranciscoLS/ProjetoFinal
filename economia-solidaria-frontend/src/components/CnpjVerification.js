import React, { useState } from "react";
import axios from "axios";

const CnpjVerification = () => {
  const [cnpj, setCnpj] = useState("");
  const [cnpjInfo, setCnpjInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleVerifyCNPJ = async () => {
  console.log("CNPJ sendo verificado:", cnpj); // Log para verificar o CNPJ enviado

  try {
    const response = await axios.get(
      `http://localhost/api/verificar-cnpj/${cnpj}`
    );
    console.log("Resposta da API:", response.data); // Log para verificar a resposta da API

    setCnpjInfo(response.data); // Exibe as informações do CNPJ
    setError(null); // Limpa qualquer erro anterior
  } catch (err) {
    console.error("Erro ao verificar o CNPJ:", err); // Log para verificar o erro
    setError("Erro ao verificar o CNPJ");
    setCnpjInfo(null); // Limpa informações anteriores
  }
};


  return (
    <div>
      <input
        type="text"
        value={cnpj}
        onChange={(e) => setCnpj(e.target.value)}
        placeholder="Digite o CNPJ"
      />
      <button onClick={handleVerifyCNPJ}>Verificar CNPJ</button>

      {error && <p>{error}</p>}
      {cnpjInfo && (
        <div>
          <p>
            <strong>Nome:</strong> {cnpjInfo.nome}
          </p>
          <p>
            <strong>Simples Nacional:</strong>{" "}
            {cnpjInfo.simples_nacional ? "Sim" : "Não"}
          </p>
          <p>
            <strong>MEI:</strong> {cnpjInfo.mei ? "Sim" : "Não"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CnpjVerification;
