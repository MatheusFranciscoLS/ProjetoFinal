import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // Certifique-se de importar o 'db'
import { getAuth } from "firebase/auth"; // Para pegar o UID do usuário autenticado
import "../styles/registerbusiness.css";

import InputMask from "react-input-mask"; //


const RegisterBusiness = () => {
  const [businessName, setBusinessName] = useState("");
  const [businessCNPJ, setBusinessCNPJ] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [landline, setLandline] = useState(""); // Telefone fixo
  const [cellphone, setCellphone] = useState(""); // Celular
  const [email, setEmail] = useState("");
  const [weekdaysHours, setWeekdaysHours] = useState({ open: "", close: "" }); // Segunda a sexta
  const [saturdayHours, setSaturdayHours] = useState({ open: "", close: "" }); // Sábado
  const [sundayHours, setSundayHours] = useState({ open: "", close: "" }); // Domingo
  const [images, setImages] = useState([]);
  const [cnDoc, setCnDoc] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    whatsapp: "",
  });

  const navigate = useNavigate();

  const auth = getAuth();
  const user = auth.currentUser;
  const userUid = user ? user.uid : null;

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks((prevLinks) => ({ ...prevLinks, [name]: value }));
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

  const validateForm = (formData) => {
    const errors = {};

    if (!formData.businessName) {
      errors.businessName = "O nome do negócio é obrigatório.";
    }

    if (!formData.businessCNPJ) {
      errors.businessCNPJ = "O CNPJ é obrigatório.";
    }

    if (!formData.businessDescription) {
      errors.businessDescription = "A descrição do negócio é obrigatória.";
    }

    if (!formData.category) {
      errors.category = "A categoria é obrigatória.";
    }

    if (!formData.address) {
      errors.address = "O endereço é obrigatório.";
    }

    if (!formData.landline) {
      errors.landline = "O telefone fixo é obrigatório.";
    }

    if (!formData.email) {
      errors.email = "O e-mail é obrigatório.";
    }

    if (formData.images.length === 0) {
      errors.images = "Pelo menos uma imagem é obrigatória.";
    }

    if (!formData.cnDoc) {
      errors.cnDoc = "O comprovante do Simples Nacional é obrigatório.";
    }

    if (!formData.horarioDeFuncionamento.segundaAsexta.open || !formData.horarioDeFuncionamento.segundaAsexta.close) {
      errors.horarioDeFuncionamento = "O horário de funcionamento de segunda a sexta é obrigatório.";
    }

    if (!formData.horarioDeFuncionamento.sabado.open || !formData.horarioDeFuncionamento.sabado.close) {
      errors.horarioDeFuncionamento = "O horário de funcionamento de sábado é obrigatório.";
    }

    if (!formData.horarioDeFuncionamento.domingo.open || !formData.horarioDeFuncionamento.domingo.close) {
      errors.horarioDeFuncionamento = "O horário de funcionamento de domingo é obrigatório.";
    }

    if (!formData.socialLinks.instagram || !formData.socialLinks.facebook || !formData.socialLinks.whatsapp) {
      errors.socialLinks = "As redes sociais são obrigatórias.";
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Criar objeto com todos os dados do formulário
    const formData = {
      businessName,
      businessCNPJ,
      businessDescription,
      category,
      address,
      landline,
      email,
      images,
      cnDoc,
      horarioDeFuncionamento: {
        segundaAsexta: weekdaysHours,
        sabado: saturdayHours,
        domingo: sundayHours
      },
      socialLinks
    };

    // Validar formulário
    const { isValid, errors } = validateForm(formData);

    if (!isValid) {
      setError(Object.values(errors).join('\n'));
      setLoading(false);
      return;
    }

    try {
      // Processa as imagens para base64
      const imageBase64Promises = images.map(async (image) => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result); // Salva o resultado em base64
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
      });

      const imageBase64 = await Promise.all(imageBase64Promises);

      // Envia os dados para o Firestore
      const businessData = {
        nome: businessName,
        cnpj: businessCNPJ,
        descricao: businessDescription,
        categoria: category,
        endereco: address,
        telefoneFixo: landline,
        telefoneCelular: cellphone,
        email,
        horarioDeFuncionamento: {
          segundaAsexta: weekdaysHours,
          sabado: saturdayHours,
          domingo: sundayHours,
        },
        imagens: imageBase64,
        comprovante: cnDoc.name,
        userId: userUid,
        status: "pendente",
        redesSociais: {
          instagram: socialLinks.instagram || "",
          facebook: socialLinks.facebook || "",
          whatsapp: socialLinks.whatsapp ? socialLinks.whatsapp.replace(/[^\d]/g, "") : ""
        },
      };

      await addDoc(collection(db, "negocios_pendentes"), businessData);

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

        <InputMask
          mask="99.999.999/9999-99" // Máscara para CNPJ
          placeholder="CNPJ"
          value={businessCNPJ}
          onChange={(e) => setBusinessCNPJ(e.target.value)}
          required
        />

        <textarea
          placeholder="Descreva o seu negócio"
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Selecione a Categoria</option>
          <option value="restaurante">Restaurante</option>
          <option value="loja">Loja</option>
          <option value="servicos">Serviços</option>
          <option value="artesanato">Artesanato</option>
          <option value="beleza">Beleza e Estética</option>
          <option value="educacao">Educação e Cursos</option>
          <option value="saude">Saúde e Bem-estar</option>
          <option value="esportes">Esportes e Lazer</option>
          <option value="outro">Outro</option>
        </select>

        <input
          type="text"
          placeholder="Endereço Completo"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        {/* Telefone Fixo */}
        <InputMask
          mask="(99) 9999-9999" // Máscara para telefone fixo
          placeholder="Telefone Fixo"
          value={landline}
          onChange={(e) => setLandline(e.target.value)}
          required
        />

        {/* Celular */}
        <InputMask
          mask="(99) 99999-9999" // Máscara para celular
          placeholder="Celular (Opcional)"
          value={cellphone}
          onChange={(e) => setCellphone(e.target.value)}
        />

        <input
          type="email"
          placeholder="E-mail para Contato"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
         <h3>Redes Sociais</h3>
        <input
          type="url"
          name="instagram"
          placeholder="Link do Instagram"
          value={socialLinks.instagram}
          onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
        />
        <input
          type="url"
          name="facebook"
          placeholder="Link do Facebook"
          value={socialLinks.facebook}
          onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
        />
        <input
          type="url"
          name="whatsapp"
          placeholder="Link do WhatsApp (com https://wa.me/)"
          value={socialLinks.whatsapp}
          onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
        />

        {/* Horário de funcionamento de segunda a sexta */}
        <div className="hours-section">
          <h3>Horário de Funcionamento (Segunda a Sexta)</h3>
          <input
            type="time"
            value={weekdaysHours.open}
            onChange={(e) =>
              setWeekdaysHours({ ...weekdaysHours, open: e.target.value })
            }
            required
          />
          <input
            type="time"
            value={weekdaysHours.close}
            onChange={(e) =>
              setWeekdaysHours({ ...weekdaysHours, close: e.target.value })
            }
            required
          />
        </div>

        {/* Horário de funcionamento de sábado */}
        <div className="hours-section">
          <h3>Horário de Funcionamento (Sábado)</h3>
          <input
            type="time"
            value={saturdayHours.open}
            onChange={(e) =>
              setSaturdayHours({ ...saturdayHours, open: e.target.value })
            }
          />
          <input
            type="time"
            value={saturdayHours.close}
            onChange={(e) =>
              setSaturdayHours({ ...saturdayHours, close: e.target.value })
            }
          />
        </div>

        {/* Horário de funcionamento de domingo */}
        <div className="hours-section">
          <h3>Horário de Funcionamento (Domingo)</h3>
          <input
            type="time"
            value={sundayHours.open}
            onChange={(e) =>
              setSundayHours({ ...sundayHours, open: e.target.value })
            }
          />
          <input
            type="time"
            value={sundayHours.close}
            onChange={(e) =>
              setSundayHours({ ...sundayHours, close: e.target.value })
            }
          />
        </div>

        <div className="upload-instructions">
          <label htmlFor="businessImages">
            <strong>
              Carregue imagens do seu negócio (máximo de 6 imagens)
            </strong>
          </label>
          <input
            type="file"
            id="businessImages"
            accept="image/*"
            multiple
            required
            onChange={handleImageUpload}
          />

          {images.length > 0 && (
            <div className="image-preview">
              {images.map((image, index) => (
                <div key={index} className="image-wrapper">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`preview ${index}`}
                    className="image-item"
                  />

                  <button
                    className="remove-image"
                    onClick={() => removeImage(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error &&
          error.includes("Você pode enviar no máximo 6 imagens") && (
            <div className="error">{error}</div>
          )}
        {error && error.includes("Pelo menos uma imagem") && (
          <div className="error">{error}</div>
        )}

        <div className="upload-instructions">
          <label htmlFor="cnDoc">
            <strong>Comprovante do Simples Nacional</strong>
          </label>
          <input
            type="file"
            id="cnDoc"
            accept="application/pdf"
            onChange={(e) => setCnDoc(e.target.files[0])}
            required
          />
        </div>

        {error &&
          !error.includes("Você pode enviar no máximo 6 imagens") && (
            <div className="error">{error}</div>
          )}

        {loading && <div className="loading">Carregando...</div>}

        <div className="terms-container">
          {" "}
          {/* Corrigido para manter a classe correta */}
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          <label htmlFor="terms">
            Aceito os <strong>termos e condições</strong>
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