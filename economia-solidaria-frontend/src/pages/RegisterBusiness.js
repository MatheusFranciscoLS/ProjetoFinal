import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import InputMask from "react-input-mask";
import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";
import { validateForm, validateImageFile } from "../components/validation";
import "../styles/registerbusiness.css";

const RegisterBusiness = () => {
  // Form state management
  const initialFormState = {
    business: {
      name: "",
      cnpj: "",
      description: "",
      category: "",
      email: "",
    },
    contact: {
      telefone: "",
      cellphone: "",
    },
    address: {
      cep: "",
      logradouro: "",
      bairro: "",
      cidade: "",
      uf: "",
      numero: "",
      complemento: "",
    },
    hours: {
      weekdays: { open: "", close: "" },
      saturday: { open: "", close: "", closed: true },
      sunday: { open: "", close: "", closed: true },
      lunch: {
        enabled: false,
        start: "",
        end: "",
      },
    },
    social: {
      instagram: "",
      facebook: "",
      whatsapp: "",
    },
    media: {
      images: [],
      cnDoc: null,
    },
    terms: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWeekend, setShowWeekend] = useState(false);
  const [showSocialInputs, setShowSocialInputs] = useState({
    instagram: false,
    facebook: false,
    whatsapp: false,
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [errorCep, setErrorCep] = useState("");

  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  // Form field update handlers
  const updateFormField = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    updateFormField("social", platform, value);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentImages = formData.media.images;

    if (files.length + currentImages.length > 6) {
      setError("Você pode enviar no máximo 6 imagens");
      return;
    }

    const invalidImages = files.filter((file) => !validateImageFile(file).isValid);
    if (invalidImages.length > 0) {
      setError(
        "Uma ou mais imagens são inválidas. Use apenas JPG, PNG ou GIF com tamanho máximo de 5MB."
      );
      return;
    }

    updateFormField("media", "images", [...currentImages, ...files]);
    setError("");
  };

  const removeImage = (index) => {
    const updatedImages = formData.media.images.filter((_, i) => i !== index);
    updateFormField("media", "images", updatedImages);
  };

  // CEP auto-complete
  const buscarCep = async (cepValue) => {
    const cepLimpo = cepValue.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return;
    }

    setLoadingCep(true);
    setErrorCep("");

    try {
      const response = await fetch(
        `https://brasilapi.com.br/api/cep/v2/${cepLimpo}`
      );
      const data = await response.json();

      if (!response.ok || data.errors) {
        setErrorCep("CEP não encontrado");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          logradouro: data.street || "",
          bairro: data.neighborhood || "",
          cidade: data.city || "",
          uf: data.state || "",
        },
      }));

    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setErrorCep("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate form data
      const validationResult = validateForm(formData);
      if (!validationResult.isValid) {
        setError(validationResult.error);
        return;
      }

      // Prepare data for submission
      const businessData = {
        ...formData,
        userId: user.uid,
        createdAt: new Date(),
        status: "pending",
      };

      // Submit to Firebase
      const docRef = await addDoc(collection(db, "businesses"), businessData);

      // Success - redirect to confirmation page
      navigate(`/business-confirmation/${docRef.id}`);
    } catch (error) {
      setError("Erro ao cadastrar negócio. Por favor, tente novamente.");
      console.error("Error submitting business:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-business-container">
      <h1 className="register-title">Cadastro de Negócio</h1>
      <p className="register-subtitle">
        Preencha as informações abaixo para cadastrar seu negócio na plataforma
      </p>

      <form onSubmit={handleSubmit} className="register-form">
        {/* Business Information Section */}
        <section className="form-section">
          <h2>Informações do Negócio</h2>
          <div className="form-group">
            <label htmlFor="businessName">Nome do Negócio*</label>
            <input
              type="text"
              id="businessName"
              value={formData.business.name}
              onChange={(e) => updateFormField("business", "name", e.target.value)}
              placeholder="Nome do seu negócio"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessCNPJ">CNPJ*</label>
            <InputMask
              mask="99.999.999/9999-99"
              id="businessCNPJ"
              value={formData.business.cnpj}
              onChange={(e) => updateFormField("business", "cnpj", e.target.value)}
              placeholder="00.000.000/0000-00"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessDescription">Descrição do Negócio*</label>
            <textarea
              id="businessDescription"
              value={formData.business.description}
              onChange={(e) =>
                updateFormField("business", "description", e.target.value)
              }
              placeholder="Descreva o seu negócio"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessCategory">Categoria do Negócio*</label>
            <select
              id="businessCategory"
              value={formData.business.category}
              onChange={(e) =>
                updateFormField("business", "category", e.target.value)
              }
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
          </div>

          <div className="form-group">
            <label htmlFor="businessEmail">E-mail para Contato*</label>
            <input
              type="email"
              id="businessEmail"
              value={formData.business.email}
              onChange={(e) => updateFormField("business", "email", e.target.value)}
              placeholder="E-mail para contato"
              required
            />
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="form-section">
          <h2>Informações de Contato</h2>
          <div className="form-group">
            <label htmlFor="telefone">Telefone Fixo</label>
            <InputMask
              mask="(99) 9999-9999"
              id="telefone"
              value={formData.contact.telefone}
              onChange={(e) => updateFormField("contact", "telefone", e.target.value)}
              placeholder="(00) 0000-0000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cellphone">Celular (Opcional)</label>
            <InputMask
              mask="(99) 99999-9999"
              id="cellphone"
              value={formData.contact.cellphone}
              onChange={(e) => updateFormField("contact", "cellphone", e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
        </section>

        {/* Address Section */}
        <section className="form-section">
          <h2>Endereço</h2>
          <div className="form-group">
            <label htmlFor="cep">CEP*</label>
            <InputMask
              mask="99999-999"
              id="cep"
              value={formData.address.cep}
              onChange={(e) => {
                updateFormField("address", "cep", e.target.value);
                if (e.target.value.replace(/\D/g, "").length === 8) {
                  buscarCep(e.target.value);
                }
              }}
              placeholder="00000-000"
              required
            />
            {loadingCep && <span className="loading-cep">Buscando CEP...</span>}
            {errorCep && <span className="error-cep">{errorCep}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="logradouro">Logradouro*</label>
            <input
              type="text"
              id="logradouro"
              value={formData.address.logradouro}
              onChange={(e) => updateFormField("address", "logradouro", e.target.value)}
              placeholder="Logradouro"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bairro">Bairro*</label>
            <input
              type="text"
              id="bairro"
              value={formData.address.bairro}
              onChange={(e) => updateFormField("address", "bairro", e.target.value)}
              placeholder="Bairro"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cidade">Cidade*</label>
            <input
              type="text"
              id="cidade"
              value={formData.address.cidade}
              onChange={(e) => updateFormField("address", "cidade", e.target.value)}
              placeholder="Cidade"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="uf">UF*</label>
            <input
              type="text"
              id="uf"
              value={formData.address.uf}
              onChange={(e) => updateFormField("address", "uf", e.target.value)}
              placeholder="UF"
              required
              maxLength="2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="numero">Número*</label>
            <input
              type="text"
              id="numero"
              value={formData.address.numero}
              onChange={(e) => updateFormField("address", "numero", e.target.value)}
              placeholder="Número"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="complemento">Complemento (Opcional)</label>
            <input
              type="text"
              id="complemento"
              value={formData.address.complemento}
              onChange={(e) => updateFormField("address", "complemento", e.target.value)}
              placeholder="Complemento"
            />
          </div>
        </section>

        {/* Hours Section */}
        <section className="form-section">
          <h2>Horário de Funcionamento</h2>
          <div className="form-group">
            <label>Segunda a Sexta*</label>
            <div className="time-inputs">
              <input
                type="time"
                value={formData.hours.weekdays.open}
                onChange={(e) =>
                  updateFormField("hours", "weekdays", {
                    ...formData.hours.weekdays,
                    open: e.target.value,
                  })
                }
                required
              />
              <span>até</span>
              <input
                type="time"
                value={formData.hours.weekdays.close}
                onChange={(e) =>
                  updateFormField("hours", "weekdays", {
                    ...formData.hours.weekdays,
                    close: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Sábado</label>
            <div className="time-inputs">
              <label>
                <input
                  type="checkbox"
                  checked={!formData.hours.saturday.closed}
                  onChange={(e) =>
                    updateFormField("hours", "saturday", {
                      ...formData.hours.saturday,
                      closed: !e.target.checked,
                    })
                  }
                />
                Aberto aos sábados
              </label>
              {!formData.hours.saturday.closed && (
                <>
                  <input
                    type="time"
                    value={formData.hours.saturday.open}
                    onChange={(e) =>
                      updateFormField("hours", "saturday", {
                        ...formData.hours.saturday,
                        open: e.target.value,
                      })
                    }
                  />
                  <span>até</span>
                  <input
                    type="time"
                    value={formData.hours.saturday.close}
                    onChange={(e) =>
                      updateFormField("hours", "saturday", {
                        ...formData.hours.saturday,
                        close: e.target.value,
                      })
                    }
                  />
                </>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Domingo</label>
            <div className="time-inputs">
              <label>
                <input
                  type="checkbox"
                  checked={!formData.hours.sunday.closed}
                  onChange={(e) =>
                    updateFormField("hours", "sunday", {
                      ...formData.hours.sunday,
                      closed: !e.target.checked,
                    })
                  }
                />
                Aberto aos domingos
              </label>
              {!formData.hours.sunday.closed && (
                <>
                  <input
                    type="time"
                    value={formData.hours.sunday.open}
                    onChange={(e) =>
                      updateFormField("hours", "sunday", {
                        ...formData.hours.sunday,
                        open: e.target.value,
                      })
                    }
                  />
                  <span>até</span>
                  <input
                    type="time"
                    value={formData.hours.sunday.close}
                    onChange={(e) =>
                      updateFormField("hours", "sunday", {
                        ...formData.hours.sunday,
                        close: e.target.value,
                      })
                    }
                  />
                </>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Intervalo para Almoço</label>
            <div className="time-inputs">
              <label>
                <input
                  type="checkbox"
                  checked={formData.hours.lunch.enabled}
                  onChange={(e) =>
                    updateFormField("hours", "lunch", {
                      ...formData.hours.lunch,
                      enabled: e.target.checked,
                    })
                  }
                />
                Fecha para o almoço
              </label>
              {formData.hours.lunch.enabled && (
                <>
                  <input
                    type="time"
                    value={formData.hours.lunch.start}
                    onChange={(e) =>
                      updateFormField("hours", "lunch", {
                        ...formData.hours.lunch,
                        start: e.target.value,
                      })
                    }
                  />
                  <span>até</span>
                  <input
                    type="time"
                    value={formData.hours.lunch.end}
                    onChange={(e) =>
                      updateFormField("hours", "lunch", {
                        ...formData.hours.lunch,
                        end: e.target.value,
                      })
                    }
                  />
                </>
              )}
            </div>
          </div>
        </section>

        {/* Social Media Section */}
        <section className="form-section">
          <h2>Redes Sociais</h2>
          <div className="social-icons">
            <div className="social-icon-wrapper">
              <FaInstagram
                className={`social-icon ${
                  showSocialInputs.instagram ? "active" : ""
                }`}
                onClick={() =>
                  setShowSocialInputs({
                    ...showSocialInputs,
                    instagram: !showSocialInputs.instagram,
                  })
                }
              />
              {showSocialInputs.instagram && (
                <input
                  type="url"
                  name="instagram"
                  placeholder="Link do Instagram"
                  value={formData.social.instagram}
                  onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                  className="social-input"
                />
              )}
            </div>

            <div className="social-icon-wrapper">
              <FaFacebook
                className={`social-icon ${
                  showSocialInputs.facebook ? "active" : ""
                }`}
                onClick={() =>
                  setShowSocialInputs({
                    ...showSocialInputs,
                    facebook: !showSocialInputs.facebook,
                  })
                }
              />
              {showSocialInputs.facebook && (
                <input
                  type="url"
                  name="facebook"
                  placeholder="Link do Facebook"
                  value={formData.social.facebook}
                  onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                  className="social-input"
                />
              )}
            </div>

            <div className="social-icon-wrapper">
              <FaWhatsapp
                className={`social-icon ${
                  showSocialInputs.whatsapp ? "active" : ""
                }`}
                onClick={() =>
                  setShowSocialInputs({
                    ...showSocialInputs,
                    whatsapp: !showSocialInputs.whatsapp,
                  })
                }
              />
              {showSocialInputs.whatsapp && (
                <input
                  type="url"
                  name="whatsapp"
                  placeholder="Link do WhatsApp (https://api.whatsapp/ ou https://wa.me/)"
                  value={formData.social.whatsapp}
                  onChange={(e) => handleSocialLinkChange("whatsapp", e.target.value)}
                  className="social-input"
                />
              )}
            </div>
          </div>
        </section>

        {/* Media Section */}
        <section className="form-section">
          <h2>Imagens do Negócio</h2>
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

            {formData.media.images.length > 0 && (
              <div className="image-preview">
                {formData.media.images.map((image, index) => (
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
              onChange={(e) => updateFormField("media", "cnDoc", e.target.files[0])}
              required
            />
          </div>
        </section>

        {/* Terms and Conditions Section */}
        <section className="form-section">
          <h2>Termos e Condições</h2>
          <div className="termos-container">
            <input
              type="checkbox"
              id="terms"
              checked={formData.terms}
              onChange={(e) => updateFormField("terms", e.target.checked)}
              required
            />
            <label htmlFor="terms">
              Aceito os{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                <strong>termos e condições</strong>
              </a>
            </label>
          </div>
        </section>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Cadastrar Negócio"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default RegisterBusiness;
