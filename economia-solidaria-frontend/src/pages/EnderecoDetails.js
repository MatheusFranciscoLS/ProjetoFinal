import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Certifique-se de ajustar o caminho correto para o arquivo firebase.js
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

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Chave do Google Maps apenas para o mapa
  });

  useEffect(() => {
    const fetchAddressAndCoordinates = async () => {
      try {
        // Busca o endereço no Firestore
        const docRef = doc(db, "lojas", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetchedAddress = docSnap.data().endereco;
          setAddress(fetchedAddress);

          // Envia o endereço ao backend para geocodificação
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/geocode`,
            { params: { address: fetchedAddress } }
          );

          setCoordinates(response.data.coordinates);
        } else {
          setError("Loja não encontrada.");
        }
      } catch (err) {
        setError("Erro ao buscar endereço ou coordenadas.");
        console.error(err);
      }
    };

    fetchAddressAndCoordinates();
  }, [id]);

  if (error) return <p>{error}</p>;

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
