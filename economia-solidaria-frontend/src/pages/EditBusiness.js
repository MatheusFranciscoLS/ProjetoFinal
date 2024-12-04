import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import InputMask from "react-input-mask";
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { validateForm } from "../components/validationEdit";
import "../styles/editbusiness.css";

const EditBusiness = () => {
  const { id } = useParams();
  const [businessName, setBusinessName] = useState("");
  const [businessCNPJ, setBusinessCNPJ] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories] = useState([
    "Restaurante",
    "Loja",
    "Serviços",
    "Artesanato",
    "Beleza e Estética",
    "Educação e Cursos",
    "Saúde e Bem-estar",
   " Esportes e Lazer",
    "Outro"
  ]);
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

  // Função para formatar horário
  const formatHorario = (horario) => {
    if (!horario || typeof horario !== 'object') {
      return "Horário não disponível";
    }
    
    if (horario.closed) {
      return "Fechado";
    }
    
    const openTime = horario.open || "";
    const closeTime = horario.close || "";
    
    if (!openTime || !closeTime) {
      return "Horário não disponível";
    }
    
    return `${openTime} às ${closeTime}`;
  };

  // Função para formatar todos os horários
  const formatHorarioCompleto = (horarios) => {
    if (!horarios) return "Horários não disponíveis";

    const horariosSemana = horarios.segundaAsexta 
      ? `Segunda a Sexta: ${formatHorario(horarios.segundaAsexta)}`
      : "Segunda a Sexta: Horário não disponível";

    const horarioSabado = horarios.sabado
      ? `Sábado: ${horarios.sabado.closed ? "Fechado" : formatHorario(horarios.sabado)}`
      : "Sábado: Horário não disponível";

    const horarioDomingo = horarios.domingo
      ? `Domingo: ${horarios.domingo.closed ? "Fechado" : formatHorario(horarios.domingo)}`
      : "Domingo: Horário não disponível";

    const horarioAlmoco = horarios.lunchBreak?.isClosed
      ? `Horário de Almoço: ${horarios.lunchBreak.start} às ${horarios.lunchBreak.end}`
      : "";

    return [
      horariosSemana,
      horarioAlmoco,
      horarioSabado,
      horarioDomingo
    ].filter(Boolean).join('\n');
  };

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!id) {
        console.error("ID do negócio não fornecido");
        setError("ID do negócio não encontrado");
        return;
      }

      try {
        const docRef = doc(db, "lojas", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          console.error(`Negócio com ID ${id} não encontrado`);
          setError("Negócio não encontrado!");
          return;
        }

        const data = docSnap.data();
        
        // Dados básicos
        setBusinessName(data.nome || "");
        setBusinessCNPJ(data.cnpj || "");
        setBusinessDescription(data.descricao || "");
        setCategory(data.categoria || "");
        setAddress(data.endereco || "");
        setEmail(data.email || "");
        setTelefone(data.telefoneFixo || "");
        setCellphone(data.telefoneCelular || "");

        // Horários de funcionamento
        const hours = data.horarioDeFuncionamento || {};
        
        // Segunda a sexta
        if (hours.segundaAsexta) {
          setWeekdaysHours({
            open: hours.segundaAsexta.open || "",
            close: hours.segundaAsexta.close || ""
          });
        }

        // Horário de almoço
        if (hours.lunchBreak) {
          setLunchBreak(hours.lunchBreak.isClosed || false);
          setLunchStart(hours.lunchBreak.start || "");
          setLunchEnd(hours.lunchBreak.end || "");
        }

        // Fim de semana
        if (hours.sabado || hours.domingo) {
          setShowWeekend(true);
          
          setSaturdayHours({
            open: hours.sabado?.open || "",
            close: hours.sabado?.close || "",
            closed: hours.sabado?.closed !== false
          });

          setSundayHours({
            open: hours.domingo?.open || "",
            close: hours.domingo?.close || "",
            closed: hours.domingo?.closed !== false
          });
        }

        // Redes sociais
        const socialLinks = data.redesSociais || {};
        setSocialLinks({
          instagram: socialLinks.instagram || "",
          facebook: socialLinks.facebook || "",
          whatsapp: socialLinks.whatsapp || ""
        });

        setShowSocialInputs({
          instagram: !!socialLinks.instagram,
          facebook: !!socialLinks.facebook,
          whatsapp: !!socialLinks.whatsapp
        });

      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError(`Erro ao carregar dados: ${err.message}`);
      }
    };

    fetchBusiness();
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

    try {
      if (!user) {
        setError("Você precisa estar logado para editar um negócio.");
        return;
      }

      // Validar telefone fixo
      const fixedPhoneRegex = /^\(\d{2}\)\s\d{4}-\d{4}$/;
      const cellPhoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;

      if (telefone && !fixedPhoneRegex.test(telefone)) {
        setError("Formato de telefone fixo inválido. Use (00) 0000-0000");
        return;
      }

      if (cellphone && !cellPhoneRegex.test(cellphone)) {
        setError("Formato de celular inválido. Use (00) 00000-0000");
        return;
      }

      // Validar horários de funcionamento
      if (!weekdaysHours.open || !weekdaysHours.close) {
        setError("Horário de funcionamento de segunda a sexta é obrigatório");
        return;
      }

      // Validar horário de almoço se estiver ativo
      if (lunchBreak && (!lunchStart || !lunchEnd)) {
        setError("Se o horário de almoço estiver ativo, início e fim são obrigatórios");
        return;
      }

      // Validar horários de fim de semana se estiverem ativos
      if (showWeekend) {
        if (!saturdayHours.closed && (!saturdayHours.open || !saturdayHours.close)) {
          setError("Se aberto aos sábados, informe o horário de funcionamento");
          return;
        }
        if (!sundayHours.closed && (!sundayHours.open || !sundayHours.close)) {
          setError("Se aberto aos domingos, informe o horário de funcionamento");
          return;
        }
      }

      // Preparar horários de funcionamento
      const businessHours = {
        segundaAsexta: {
          open: weekdaysHours.open,
          close: weekdaysHours.close
        },
        lunchBreak: {
          isClosed: lunchBreak,
          start: lunchBreak ? lunchStart : "",
          end: lunchBreak ? lunchEnd : ""
        },
        sabado: {
          open: showWeekend && !saturdayHours.closed ? saturdayHours.open : "",
          close: showWeekend && !saturdayHours.closed ? saturdayHours.close : "",
          closed: !showWeekend || saturdayHours.closed
        },
        domingo: {
          open: showWeekend && !sundayHours.closed ? sundayHours.open : "",
          close: showWeekend && !sundayHours.closed ? sundayHours.close : "",
          closed: !showWeekend || sundayHours.closed
        }
      };

      const formData = {
        nome: businessName.trim(),
        cnpj: businessCNPJ.trim(),
        descricao: businessDescription.trim(),
        categoria: category.trim(),
        endereco: address.trim(),
        telefoneFixo: telefone,
        telefoneCelular: cellphone,
        email: email.trim(),
        horarioDeFuncionamento: businessHours,
        redesSociais: {
          instagram: socialLinks.instagram.trim(),
          facebook: socialLinks.facebook.trim(),
          whatsapp: socialLinks.whatsapp.trim()
        }
      };

      // Validar o formulário
      const validation = validateForm(formData);
      if (!validation.isValid) {
        const errorMessages = Object.entries(validation.errors)
          .map(([field, message]) => message)
          .filter(message => message);
        
        setError(errorMessages.join('\n'));
        return;
      }

      // Atualizar no Firestore
      const businessRef = doc(db, "lojas", id);
      await updateDoc(businessRef, formData);
      
      alert("Negócio atualizado com sucesso!");
      navigate("/meus-negocios");
    } catch (err) {
      console.error("Erro ao atualizar negócio:", err);
      setError(`Erro ao atualizar o negócio: ${err.message}`);
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

        <input
          type="text"
          placeholder="CNPJ"
          value={businessCNPJ}
          onChange={(e) => setBusinessCNPJ(e.target.value)}
          required
        />

        <textarea
          placeholder="Descrição do Negócio"
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Endereço"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <InputMask
          mask="(99) 9999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="Telefone Fixo"
        >
          {(inputProps) => (
            <input
              {...inputProps}
              type="text"
              className={telefone ? "filled" : ""}
            />
          )}
        </InputMask>

        <InputMask
          mask="(99) 99999-9999"
          value={cellphone}
          onChange={(e) => setCellphone(e.target.value)}
          placeholder="Celular"
        >
          {(inputProps) => (
            <input
              {...inputProps}
              type="text"
              className={cellphone ? "filled" : ""}
            />
          )}
        </InputMask>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Exibição do horário de funcionamento atual */}
        <div className="horario-funcionamento">
          <h3>Horário de Funcionamento Atual</h3>
          <div className="horario-info">
            <div className="horario-linha">
              <strong>Segunda a Sexta:</strong>{' '}
              {weekdaysHours && weekdaysHours.open && weekdaysHours.close
                ? `${weekdaysHours.open} às ${weekdaysHours.close}`
                : 'Horário não definido'}
            </div>
            
            {lunchBreak && lunchStart && lunchEnd && (
              <div className="horario-linha">
                <strong>Horário de Almoço:</strong>{' '}
                {`${lunchStart} às ${lunchEnd}`}
              </div>
            )}
            
            {showWeekend && (
              <>
                <div className="horario-linha">
                  <strong>Sábado:</strong>{' '}
                  {saturdayHours.closed
                    ? 'Fechado'
                    : saturdayHours.open && saturdayHours.close
                    ? `${saturdayHours.open} às ${saturdayHours.close}`
                    : 'Horário não definido'}
                </div>
                <div className="horario-linha">
                  <strong>Domingo:</strong>{' '}
                  {sundayHours.closed
                    ? 'Fechado'
                    : sundayHours.open && sundayHours.close
                    ? `${sundayHours.open} às ${sundayHours.close}`
                    : 'Horário não definido'}
                </div>
              </>
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
            {/* Horário de funcionamento de sábado */}
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

            {/* Horário de funcionamento de domingo */}
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