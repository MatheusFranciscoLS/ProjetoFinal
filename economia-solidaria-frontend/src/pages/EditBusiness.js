import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import InputMask from "react-input-mask";
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { validateForm } from "../components/validation";
import "../styles/editBusiness.css";

const EditBusiness = () => {
  const { id } = useParams();
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
  const [lunchBreak, setLunchBreak] = useState(false);
  const [lunchStart, setLunchStart] = useState("");
  const [lunchEnd, setLunchEnd] = useState("");
  const [showWeekend, setShowWeekend] = useState(false);
  const [images, setImages] = useState([]);
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

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const docRef = doc(db, "lojas", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setBusinessName(data.nome || "");
          setBusinessCNPJ(data.cnpj || "");
          setBusinessDescription(data.descricao || "");
          setCategory(data.categoria || "");
          setAddress(data.endereco || "");
          setTelefone(data.telefoneFixo || "");
          setCellphone(data.telefoneCelular || "");
          setEmail(data.email || "");
          
          // Carregar horários
          if (data.horarioDeFuncionamento) {
            // Segunda a Sexta
            if (data.horarioDeFuncionamento.segundaAsexta) {
              setWeekdaysHours({
                open: data.horarioDeFuncionamento.segundaAsexta.open || "",
                close: data.horarioDeFuncionamento.segundaAsexta.close || ""
              });
            }

            // Sábado
            if (data.horarioDeFuncionamento.sabado) {
              setSaturdayHours({
                open: data.horarioDeFuncionamento.sabado.open || "",
                close: data.horarioDeFuncionamento.sabado.close || "",
                closed: data.horarioDeFuncionamento.sabado.open === "00:00" && 
                       data.horarioDeFuncionamento.sabado.close === "00:00"
              });
              setShowWeekend(true);
            }

            // Domingo
            if (data.horarioDeFuncionamento.domingo) {
              setSundayHours({
                open: data.horarioDeFuncionamento.domingo.open || "",
                close: data.horarioDeFuncionamento.domingo.close || "",
                closed: data.horarioDeFuncionamento.domingo.open === "00:00" && 
                       data.horarioDeFuncionamento.domingo.close === "00:00"
              });
              setShowWeekend(true);
            }
          }

          setSocialLinks(data.redesSociais || { instagram: "", facebook: "", whatsapp: "" });
          
          // Ativar inputs de redes sociais se existirem
          setShowSocialInputs({
            instagram: !!data.redesSociais?.instagram,
            facebook: !!data.redesSociais?.facebook,
            whatsapp: !!data.redesSociais?.whatsapp
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Erro ao carregar dados do negócio");
      }
    };

    if (id) {
      fetchBusinessData();
    }
  }, [id]);

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
        segundaAsexta: {
          open: weekdaysHours.open,
          close: weekdaysHours.close
        },
        sabado: {
          open: !saturdayHours.closed ? saturdayHours.open : "00:00",
          close: !saturdayHours.closed ? saturdayHours.close : "00:00"
        },
        domingo: {
          open: !sundayHours.closed ? sundayHours.open : "00:00",
          close: !sundayHours.closed ? sundayHours.close : "00:00"
        }
      },
      redesSociais: {
        instagram: socialLinks.instagram || "",
        facebook: socialLinks.facebook || "",
        whatsapp: socialLinks.whatsapp || ""
      }
    };

    try {
      if (!user) {
        setError("Você precisa estar logado para editar um negócio.");
        return;
      }

      // Validar o formulário
      const validation = validateForm(formData);
      if (!validation.isValid) {
        const errorMessages = Object.entries(validation.errors)
          .map(([field, message]) => message)
          .filter(message => message);
        
        setError(errorMessages.join('\n'));
        setLoading(false);
        return;
      }

      // Atualizar no Firestore
      const businessRef = doc(db, "lojas", id);
      await updateDoc(businessRef, formData);

      alert("Negócio atualizado com sucesso!");
      navigate("/meus-negocios");
    } catch (err) {
      console.error("Erro ao atualizar negócio:", err);
      setError("Erro ao atualizar o negócio. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-business-page">
      <form className="edit-business-form" onSubmit={handleSubmit}>
        <h2>Editar Negócio</h2>

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
              className={`social-icon ${showSocialInputs.instagram ? "active" : ""}`}
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
                value={socialLinks.instagram}
                onChange={handleSocialLinkChange}
                className="social-input"
              />
            )}
          </div>

          <div className="social-icon-wrapper">
            <FaFacebook
              className={`social-icon ${showSocialInputs.facebook ? "active" : ""}`}
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
                value={socialLinks.facebook}
                onChange={handleSocialLinkChange}
                className="social-input"
              />
            )}
          </div>

          <div className="social-icon-wrapper">
            <FaWhatsapp
              className={`social-icon ${showSocialInputs.whatsapp ? "active" : ""}`}
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
                placeholder="Link do WhatsApp"
                value={socialLinks.whatsapp}
                onChange={handleSocialLinkChange}
                className="social-input"
              />
            )}
          </div>
        </div>

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

        <div className="lunch-break-toggle">
          <label>
            <input
              type="checkbox"
              checked={lunchBreak}
              onChange={(e) => setLunchBreak(e.target.checked)}
            />
            Fecha para o almoço?
          </label>
        </div>

        {lunchBreak && (
          <div className="lunch-break-hours">
            <label>
              Horário de fechamento para o almoço:
              <input
                type="time"
                value={lunchStart}
                onChange={(e) => setLunchStart(e.target.value)}
              />
              até
              <input
                type="time"
                value={lunchEnd}
                onChange={(e) => setLunchEnd(e.target.value)}
              />
            </label>
          </div>
        )}

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
            <div className="hours-section">
              <h3>Horário de Funcionamento (Sábado)</h3>
              <div className="time-inputs">
                <label>
                  <input
                    type="checkbox"
                    checked={!saturdayHours.closed}
                    onChange={(e) =>
                      setSaturdayHours({
                        ...saturdayHours,
                        closed: !e.target.checked,
                      })
                    }
                  />
                  Aberto aos sábados
                </label>
                {!saturdayHours.closed && (
                  <>
                    <input
                      type="time"
                      value={saturdayHours.open}
                      onChange={(e) =>
                        setSaturdayHours({
                          ...saturdayHours,
                          open: e.target.value,
                        })
                      }
                    />
                    <span>até</span>
                    <input
                      type="time"
                      value={saturdayHours.close}
                      onChange={(e) =>
                        setSaturdayHours({
                          ...saturdayHours,
                          close: e.target.value,
                        })
                      }
                    />
                  </>
                )}
              </div>
            </div>

            <div className="hours-section">
              <h3>Horário de Funcionamento (Domingo)</h3>
              <div className="time-inputs">
                <label>
                  <input
                    type="checkbox"
                    checked={!sundayHours.closed}
                    onChange={(e) =>
                      setSundayHours({
                        ...sundayHours,
                        closed: !e.target.checked,
                      })
                    }
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
                        setSundayHours({
                          ...sundayHours,
                          close: e.target.value,
                        })
                      }
                    />
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="error">
            {error.split("\n").map((err, index) => (
              <p key={index}>{err}</p>
            ))}
          </div>
        )}

        {loading && <div className="loading">Carregando...</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
};

export default EditBusiness;