import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import axios from "axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const EnderecoDetails = () => {
  const { id } = useParams();
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const fetchAddressAndCoordinates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verifica se o ID foi fornecido
        if (!id) {
          setError("ID da loja não fornecido");
          return;
        }

        // Busca o endereço no Firestore
        const docRef = doc(db, "lojas", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Loja não encontrada.");
          return;
        }

        const lojaData = docSnap.data();
        
        // Verifica se o endereço existe
        if (!lojaData?.endereco) {
          setError("Endereço não cadastrado para esta loja.");
          return;
        }

        setAddress(lojaData.endereco);

        // Verifica se a URL do backend está configurada
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        if (!backendUrl) {
          setError("URL do backend não configurada.");
          return;
        }

        // Envia o endereço ao backend para geocodificação
        const response = await axios.get(
          `${backendUrl}/api/geocode`,
          { 
            params: { address: lojaData.endereco },
            timeout: 5000 // Timeout de 5 segundos
          }
        );

        // Verifica se a resposta contém as coordenadas
        if (!response?.data?.coordinates) {
          setError("Não foi possível obter as coordenadas do endereço.");
          return;
        }

        setCoordinates(response.data.coordinates);
      } catch (err) {
        console.error("Erro detalhado:", err);
        if (err.response) {
          // Erro da resposta do servidor
          setError(`Erro do servidor: ${err.response.status}`);
        } else if (err.request) {
          // Erro de conexão
          setError("Erro de conexão com o servidor");
        } else {
          // Outros erros
          setError("Erro ao buscar endereço ou coordenadas");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAddressAndCoordinates();
  }, [id]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div>
      <h2>Endereço da Loja</h2>
      <p>{address}</p>

      {isLoaded && coordinates ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={coordinates}
          zoom={15}
        >
          <Marker position={coordinates} />
        </GoogleMap>
      ) : (
        <p>Carregando mapa...</p>
      )}
    </div>
  );
};

export default EnderecoDetails;
