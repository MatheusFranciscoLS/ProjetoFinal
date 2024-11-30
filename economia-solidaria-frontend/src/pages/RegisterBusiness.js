import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // Certifique-se de importar o 'db'
import { getAuth } from "firebase/auth"; // Para pegar o UID do usuário autenticado
import "../styles/registerbusiness.css";
import { validateForm } from "../components/validation"; // Importa a função de validação
import InputMask from "react-input-mask"; // Para máscara de telefone
import axios from "axios"; // Importando axios

const RegisterBusiness = () => {
  const [businessName, setBusinessName] = useState("");
  const [businessCNPJ, setBusinessCNPJ] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [category, setCategory] = useState("");
  const [street, setStreet] = useState(""); // Campo separado para rua
  const [neighborhood, setNeighborhood] = useState(""); // Campo separado para bairro
  const [city, setCity] = useState(""); // Campo separado para cidade
  const [state, setState] = useState(""); // Campo separado para estado
  const [number, setNumber] = useState(""); // Campo separado para número
  const [cep, setCep] = useState(""); // Campo para o CEP
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [images, setImages] = useState([]);
  const [cnDoc, setCnDoc] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const auth = getAuth();
  const user = auth.currentUser;
  const userUid = user ? user.uid : null;

  // Função para buscar o endereço pelo CEP e separar os dados
  const fetchAddress = async (cep) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (response.data.erro) {
        setError("CEP não encontrado");
        clearAddressFields();
      } else {
        const { logradouro, bairro, localidade, uf } = response.data;
        // Preenche os campos com as informações do endereço
        setStreet(logradouro);
        setNeighborhood(bairro);
        setCity(localidade);
        setState(uf);
      }
    } catch (error) {
      setError("Erro ao buscar o CEP");
      clearAddressFields();
    }
  };

  // Função para limpar os campos de endereço
  const clearAddressFields = () => {
    setStreet("");
    setNeighborhood("");
    setCity("");
    setState("");
    setNumber("");
  };

  const handleCepChange = (e) => {
    const inputCep = e.target.value;
    setCep(inputCep);

    // Verifica se o CEP tem 8 dígitos (para realizar a consulta)
    if (inputCep.length === 8) {
      fetchAddress(inputCep); // Chama a API com o CEP
    }
  };

  // Função para formatar o CNPJ
  const formatCNPJ = (cnpj) => {
    const cleaned = cnpj.replace(/[^\d]/g, ""); // Remove qualquer caractere não numérico
    if (cleaned.length <= 14) {
      return cleaned.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
      );
    }
    return cnpj;
  };

  const resizeImage = (file, maxWidth = 1024, maxHeight = 1024) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;

        // Calcula a escala para redimensionar a imagem mantendo a proporção
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type,
          0.8
        ); // Compressão de 80%
      };
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    // Verifica se a quantidade total de imagens será maior que 6
    if (files.length + images.length > 6) {
      setError("Você pode enviar no máximo 6 imagens do seu negócio.");
      return;
    }

    // Verifica se algum arquivo excede o tamanho de 10MB
    const invalidFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setError("Cada imagem deve ter no máximo 10 MB.");
      return;
    }

    // Redimensiona as imagens antes de adicionar
    const resizedImages = await Promise.all(
      files.map((file) => resizeImage(file))
    );

    // Atualiza o estado com as imagens redimensionadas
    setImages((prevImages) => [...prevImages, ...resizedImages]);
    setError(""); // Limpa a mensagem de erro
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Chama a função de validação
    const validationError = validateForm({
      businessName,
      businessCNPJ,
      businessDescription,
      category,
      street,
      neighborhood,
      city,
      state,
      number,
      phone,
      email,
      images,
      cnDoc,
      termsAccepted,
    });

    if (validationError) {
      setError(validationError); // Exibe a mensagem de erro de validação
      return;
    }

    setLoading(true);
    setError(""); // Limpa a mensagem de erro antes de tentar enviar

    try {
      const imageBase64Promises = images.map(async (image) => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result); // Salva o resultado em base64
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
      });

      const imageBase64 = await Promise.all(imageBase64Promises);

      await addDoc(collection(db, "negocios_pendentes"), {
        nome: businessName,
        cnpj: businessCNPJ,
        descricao: businessDescription,
        categoria: category,
        endereco: {
          rua: street,
          bairro: neighborhood,
          cidade: city,
          estado: state,
          numero: number,
        },
        telefone: phone,
        email,
        horarioDeFuncionamento: workingHours,
        imagens: imageBase64,
        comprovante: cnDoc.name, // Salva o nome do arquivo do comprovante
        userId: userUid, // Adiciona o UID do usuário
        status: "pendente", // Definindo o status como "pendente"
      });

      alert("Cadastro enviado, aguardando aprovação do admin!");
      navigate("/"); // Após o envio, redireciona o usuário para a home
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

        <input
          type="text"
          placeholder="CNPJ"
          value={formatCNPJ(businessCNPJ)}
          onChange={(e) => setBusinessCNPJ(e.target.value)}
          required
        />

        <textarea
          placeholder="Descrição do Negócio"
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
          required
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Selecione a Categoria</option>
          <option value="alimentacao">Alimentação</option>
          <option value="moda">Moda</option>
          <option value="saude">Saúde</option>
          <option value="outros">Outros</option>
        </select>

        <input
          type="text"
          placeholder="CEP"
          value={cep}
          onChange={handleCepChange}
          required
        />

        <input
          type="text"
          placeholder="Rua"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          disabled
        />
        <input
          type="text"
          placeholder="Bairro"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          disabled
        />
        <input
          type="text"
          placeholder="Cidade"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled
        />
        <input
          type="text"
          placeholder="Estado"
          value={state}
          onChange={(e) => setState(e.target.value)}
          disabled
        />
        <input
          type="text"
          placeholder="Número"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />

        <InputMask
          mask="(99) 99999-9999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefone"
          required
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <textarea
          placeholder="Horário de funcionamento"
          value={workingHours}
          onChange={(e) => setWorkingHours(e.target.value)}
        />

        <div className="image-upload">
          <label htmlFor="image-upload">Imagens do Negócio</label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageUpload}
            multiple
          />
          {error && <p className="error">{error}</p>}
          <div className="image-preview">
            {images.map((image, index) => (
              <div key={index} className="image-item">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`imagem ${index + 1}`}
                />
                <button type="button" onClick={() => removeImage(index)}>
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="file-upload">
          <label htmlFor="cnDoc-upload">Comprovante de Documentação</label>
          <input
            type="file"
            id="cnDoc-upload"
            accept=".pdf,.jpg,.png"
            onChange={(e) => setCnDoc(e.target.files[0])}
            required
          />
        </div>

        <div className="terms">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          <label>
            Aceito os <a href="/termos">termos de serviço</a>
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Cadastrar Negócio"}
        </button>
      </form>
    </div>
  );
};

export default RegisterBusiness;
