import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase"; // Certifique-se de importar o 'storage'
import "../styles/registerbusiness.css";

const RegisterBusiness = () => {
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [images, setImages] = useState([]);
  const [cnDoc, setCnDoc] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError("Você pode enviar no máximo 5 imagens do seu negócio.");
    } else {
      // Verifique o tamanho de cada imagem e se excede o limite (por exemplo, 5 MB por imagem)
      const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024); // Limite de 5MB por imagem
      if (invalidFiles.length > 0) {
        setError("Cada imagem deve ter no máximo 5 MB.");
      } else {
        setImages((prevImages) => [...prevImages, ...files]);
      }
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errorMessage = "";

    if (!businessName || !businessDescription || !category || !address || !phone || !email) {
      errorMessage += "Por favor, preencha todos os campos obrigatórios.\n";
    }

    if (images.length === 0 || !cnDoc) {
      errorMessage += "Por favor, carregue imagens do seu negócio e o comprovante do Simples Nacional.\n";
    }

    if (!termsAccepted) {
      errorMessage += "É necessário aceitar os Termos e Condições.\n";
    }

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Upload das imagens
      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          const imageRef = ref(storage, `lojas/${businessName}/${image.name}`);
          await uploadBytes(imageRef, image);
          return getDownloadURL(imageRef);
        })
      );

      // Upload do comprovante
      const cnDocRef = ref(storage, `lojas/${businessName}/comprovante_${cnDoc.name}`);
      await uploadBytes(cnDocRef, cnDoc);
      const cnDocURL = await getDownloadURL(cnDocRef);

      // Salvar no Firestore
      const docRef = await addDoc(collection(db, "lojas"), {
        nome: businessName,
        descricao: businessDescription,
        categoria: category,
        endereco: address,
        telefone: phone,
        email,
        horarioDeFuncionamento: workingHours,
        imagens: uploadedImages,
        comprovante: cnDocURL,
      });

      alert("Cadastro de negócio realizado com sucesso!");
      navigate(`/loja/${docRef.id}`);
    } catch (err) {
      console.error("Erro ao cadastrar negócio:", err);
      setError("Erro ao cadastrar o negócio. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-business-page">
      <form className="register-business-form" onSubmit={handleSubmit}>
        <h2>Cadastro de Negócio</h2>

        <input
          type="text"
          placeholder="Nome do Negócio"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />
        <textarea
          placeholder="Descreva o seu negócio"
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
          required
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Selecione a Categoria</option>
          <option value="restaurante">Restaurante</option>
          <option value="loja">Loja</option>
          <option value="serviço">Serviço</option>
          <option value="outro">Outro</option>
        </select>
        <input
          type="text"
          placeholder="Endereço Completo"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Telefone de Contato"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="E-mail para Contato"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Horários de Funcionamento"
          value={workingHours}
          onChange={(e) => setWorkingHours(e.target.value)}
        />

        <div className="upload-instructions">
          <label htmlFor="businessImages">
            Carregue imagens do seu negócio (máximo de 5 imagens, máximo de 5 MB cada)
          </label>
          <input
            type="file"
            id="businessImages"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
          {images.length > 0 && (
            <div className="image-preview">
              {images.map((image, index) => (
                <div key={index} className="image-wrapper">
                  <img src={URL.createObjectURL(image)} alt={`preview ${index}`} />
                  <button className="remove-image" onClick={() => removeImage(index)}>
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="upload-instructions">
          <label htmlFor="cnDoc">Comprovante do Simples Nacional</label>
          <input
            type="file"
            id="cnDoc"
            accept="application/pdf"
            onChange={(e) => setCnDoc(e.target.files[0])}
            required
          />
        </div>

        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">Carregando...</div>}

        <div className="terms-container">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <label htmlFor="terms">
            Aceito os{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Termos e Condições
            </a>
          </label>
        </div>

        <button type="submit" disabled={loading || !termsAccepted}>
          {loading ? "Cadastrando..." : "Cadastrar Negócio"}
        </button>
      </form>
    </div>
  );
};

export default RegisterBusiness;
