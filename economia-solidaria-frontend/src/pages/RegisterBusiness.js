import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import InputMask from "react-input-mask";
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { validateForm, validateImageFile } from "../components/validation";
import "../styles/registerbusiness.css";

const RegisterBusiness = () => {
  const [businessName, setBusinessName] = useState("");
  const [businessCNPJ, setBusinessCNPJ] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [email, setEmail] = useState("");
  const [weekdaysHours, setWeekdaysHours] = useState({ open: "", close: "" });
  const [saturdayHours, setSaturdayHours] = useState({ open: "", close: "", closed: true });
  const [sundayHours, setSundayHours] = useState({ open: "", close: "", closed: true });
  const [showWeekend, setShowWeekend] = useState(false);
  const [images, setImages] = useState([]);
  const [cnDoc, setCnDoc] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    facebook: "",
    whatsapp: ""
  });
  const [showSocialInputs, setShowSocialInputs] = useState({
    instagram: false,
    facebook: false,
    whatsapp: false
  });

  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 6) {
      setError("Você pode enviar no máximo 6 imagens");
      return;
    }

    // Validar cada imagem
    const invalidImages = files.filter(file => !validateImageFile(file).isValid);
    if (invalidImages.length > 0) {
      setError("Uma ou mais imagens são inválidas. Use apenas JPG, PNG ou GIF com tamanho máximo de 5MB.");
      return;
    }

    setImages(prev => [...prev, ...files]);
    setError("");
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!termsAccepted) {
        setError("Você precisa aceitar os termos e condições.");
        return;
      }

      if (!user) {
        setError("Você precisa estar logado para cadastrar um negócio.");
        return;
      }

      const imageBase64Promises = images.map(async (image) => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
      });

      const imageBase64 = await Promise.all(imageBase64Promises);

      const formData = {
        nome: businessName,
        cnpj: businessCNPJ,
        descricao: businessDescription,
        categoria: category,
        endereco: address,
        telefoneFixo: telefone,
        telefoneCelular: cellphone,
        email,
        horarioDeFuncionamento: {
          segundaAsexta: weekdaysHours,
          sabado: saturdayHours,
          domingo: sundayHours,
        },
        imagens: imageBase64,
        comprovante: cnDoc?.name,
        userId: user.uid,
        status: "pendente",
        redesSociais: socialLinks
      };

      // Validar o formulário
      const validation = validateForm(formData);
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors);
        setError(errorMessages.join('\n'));
        setLoading(false);
        return;
      }

      // Enviar para o Firestore
      await addDoc(collection(db, "negocios_pendentes"), formData);

      alert("Cadastro enviado, aguardando aprovação do admin!");
      navigate("/");
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
          mask="99.999.999/9999-99"
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

        <InputMask
          mask="(99) 9999-9999"
          placeholder="Telefone Fixo"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          required
        />

        <InputMask
          mask="(99) 99999-9999"
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
        <div className="social-icons">
          <div className="social-icon-wrapper">
            <FaInstagram 
              className={`social-icon ${showSocialInputs.instagram ? 'active' : ''}`}
              onClick={() => setShowSocialInputs({
                ...showSocialInputs,
                instagram: !showSocialInputs.instagram
              })}
            />
            {showSocialInputs.instagram && (
              <input
                type="url"
                name="instagram"
                placeholder="Link do Instagram"
                value={socialLinks.instagram}
                onChange={handleSocialLinkChange}
                className="social-input"
              />
            )}
          </div>

          <div className="social-icon-wrapper">
            <FaFacebook 
              className={`social-icon ${showSocialInputs.facebook ? 'active' : ''}`}
              onClick={() => setShowSocialInputs({
                ...showSocialInputs,
                facebook: !showSocialInputs.facebook
              })}
            />
            {showSocialInputs.facebook && (
              <input
                type="url"
                name="facebook"
                placeholder="Link do Facebook"
                value={socialLinks.facebook}
                onChange={handleSocialLinkChange}
                className="social-input"
              />
            )}
          </div>

          <div className="social-icon-wrapper">
            <FaWhatsapp 
              className={`social-icon ${showSocialInputs.whatsapp ? 'active' : ''}`}
              onClick={() => setShowSocialInputs({
                ...showSocialInputs,
                whatsapp: !showSocialInputs.whatsapp
              })}
            />
            {showSocialInputs.whatsapp && (
              <input
                type="url"
                name="whatsapp"
                placeholder="Link do WhatsApp (https://api.whatsapp/ ou https://wa.me/)"
                value={socialLinks.whatsapp}
                onChange={handleSocialLinkChange}
                className="social-input"
              />
            )}
          </div>
        </div>

        {/* Horário de funcionamento de segunda a sexta */}
        <div className="hours-section">
          <h3>Horário de Funcionamento (Segunda a Sexta)</h3>
          <div className="time-inputs">
            <input
              type="time"
              value={weekdaysHours.open}
              onChange={(e) =>
                setWeekdaysHours({ ...weekdaysHours, open: e.target.value })
              }
              required
            />
            <span>até</span>
            <input
              type="time"
              value={weekdaysHours.close}
              onChange={(e) =>
                setWeekdaysHours({ ...weekdaysHours, close: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="weekend-toggle">
          <label>
            <input
              type="checkbox"
              checked={showWeekend}
              onChange={(e) => setShowWeekend(e.target.checked)}
            />
            Funciona aos finais de semana?
          </label>
        </div>

        {showWeekend && (
          <>
            {/* Horário de funcionamento de sábado */}
            <div className="hours-section">
              <h3>Horário de Funcionamento (Sábado)</h3>
              <div className="time-inputs">
                <label>
                  <input
                    type="checkbox"
                    checked={!saturdayHours.closed}
                    onChange={(e) => setSaturdayHours({ ...saturdayHours, closed: !e.target.checked })}
                  />
                  Aberto aos sábados
                </label>
                {!saturdayHours.closed && (
                  <>
                    <input
                      type="time"
                      value={saturdayHours.open}
                      onChange={(e) =>
                        setSaturdayHours({ ...saturdayHours, open: e.target.value })
                      }
                    />
                    <span>até</span>
                    <input
                      type="time"
                      value={saturdayHours.close}
                      onChange={(e) =>
                        setSaturdayHours({ ...saturdayHours, close: e.target.value })
                      }
                    />
                  </>
                )}
              </div>
            </div>

            {/* Horário de funcionamento de domingo */}
            <div className="hours-section">
              <h3>Horário de Funcionamento (Domingo)</h3>
              <div className="time-inputs">
                <label>
                  <input
                    type="checkbox"
                    checked={!sundayHours.closed}
                    onChange={(e) => setSundayHours({ ...sundayHours, closed: !e.target.checked })}
                  />
                  Aberto aos domingos
                </label>
                {!sundayHours.closed && (
                  <>
                    <input
                      type="time"
                      value={sundayHours.open}
                      onChange={(e) =>
                        setSundayHours({ ...sundayHours, open: e.target.value })
                      }
                    />
                    <span>até</span>
                    <input
                      type="time"
                      value={sundayHours.close}
                      onChange={(e) =>
                        setSundayHours({ ...sundayHours, close: e.target.value })
                      }
                    />
                  </>
                )}
              </div>
            </div>
          </>
        )}

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
                    type="button"
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

        {error && (
          <div className="error">
            {error.split('\n').map((err, index) => (
              <p key={index}>{err}</p>
            ))}
          </div>
        )}

        {loading && <div className="loading">Carregando...</div>}

        <div className="terms-container">
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