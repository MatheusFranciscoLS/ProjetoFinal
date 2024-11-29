import React from "react";
import { useParams } from "react-router-dom";

const EnderecoDetails = () => {
  const { endereco } = useParams();

  return (
    <div>
      <h2>Detalhes do Endereço</h2>
      <p>Endereço: {decodeURIComponent(endereco)}</p>
      {/* Aqui você pode integrar um mapa, como Google Maps */}
    </div>
  );
};

export default EnderecoDetails;
