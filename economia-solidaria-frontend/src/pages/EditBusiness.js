import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import InputMask from "react-input-mask";
import "../styles/EditBusiness.css";

const EditBusiness = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [errorCep, setErrorCep] = useState("");

  const [formData, setFormData] = useState({
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
      saturday: { open: "", close: "", closed: false },
      sunday: { open: "", close: "", closed: false },
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
    },
    status: "",
    userId: "",
  });

  const checkPermission = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError("Você precisa estar logado para editar um negócio.");
      setLoading(false);
      return false;
    }

    try {
      // Primeiro, verifica se o usuário é admin
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        setError("Usuário não encontrado.");
        setLoading(false);
        return false;
      }

      const userData = userDocSnap.data();
      const adminRoles = ["admin", "administrador", "adm"];
      const isAdmin = adminRoles.includes(userData.role?.toLowerCase()) || 
                     adminRoles.includes(userData.tipo?.toLowerCase());

      // Se for admin, permite acesso imediato
      if (isAdmin) {
        return true;
      }

      // Se não for admin, verifica se é o dono do negócio
      const businessDocRef = doc(db, "lojas", id);
      const businessDocSnap = await getDoc(businessDocRef);

      if (!businessDocSnap.exists()) {
        setError("Negócio não encontrado.");
        setLoading(false);
        return false;
      }

      const businessData = businessDocSnap.data();
      const businessCreatorId = businessData.userId;

      if (currentUser.uid === businessCreatorId) {
        return true;
      }

      setError("Você não tem permissão para editar este negócio.");
      setLoading(false);
      return false;

    } catch (err) {
      console.error("Erro ao verificar permissões:", err);
      setError("Erro ao verificar permissões. Tente novamente.");
      setLoading(false);
      return false;
    }
  };

  const buscarCep = async (cepValue) => {
    const cepLimpo = cepValue.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setLoadingCep(true);
    setErrorCep("");

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cepLimpo}`);
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

  useEffect(() => {
    const fetchBusiness = async () => {
      const hasPermission = await checkPermission();
      if (!hasPermission) return;

      try {
        const businessDocRef = doc(db, "lojas", id);
        const businessDocSnap = await getDoc(businessDocRef);

        if (businessDocSnap.exists()) {
          const businessData = businessDocSnap.data();
          
          // Garantir que todas as estruturas existam com valores padrão
          const defaultHours = {
            weekdays: { open: "", close: "" },
            saturday: { open: "", close: "", closed: false },
            sunday: { open: "", close: "", closed: false },
            lunch: { enabled: false, start: "", end: "" }
          };

          setFormData({
            business: {
              name: businessData.nome || "",
              cnpj: businessData.cnpj || "",
              description: businessData.descricao || "",
              category: businessData.categoria || "",
              email: businessData.email || "",
            },
            contact: {
              telefone: businessData.telefone || "",
              cellphone: businessData.cellphone || "",
            },
            address: {
              cep: businessData.endereco?.cep || "",
              logradouro: businessData.endereco?.rua || "",
              bairro: businessData.endereco?.bairro || "",
              cidade: businessData.endereco?.cidade || "",
              uf: businessData.endereco?.estado || "",
              numero: businessData.endereco?.numero || "",
              complemento: businessData.endereco?.complemento || "",
            },
            hours: {
              weekdays: {
                open: businessData.horarioDeFuncionamento?.weekdays?.open || "",
                close: businessData.horarioDeFuncionamento?.weekdays?.close || "",
              },
              saturday: {
                open: businessData.horarioDeFuncionamento?.saturday?.open || "",
                close: businessData.horarioDeFuncionamento?.saturday?.close || "",
                closed: businessData.horarioDeFuncionamento?.saturday?.closed || false,
              },
              sunday: {
                open: businessData.horarioDeFuncionamento?.sunday?.open || "",
                close: businessData.horarioDeFuncionamento?.sunday?.close || "",
                closed: businessData.horarioDeFuncionamento?.sunday?.closed || false,
              },
              lunch: {
                enabled: businessData.horarioDeFuncionamento?.lunch?.enabled || false,
                start: businessData.horarioDeFuncionamento?.lunch?.start || "",
                end: businessData.horarioDeFuncionamento?.lunch?.end || "",
              },
            },
            social: {
              instagram: businessData.social?.instagram || "",
              facebook: businessData.social?.facebook || "",
              whatsapp: businessData.social?.whatsapp || "",
            },
            media: {
              images: businessData.imagens || [],
            },
            status: businessData.status || "",
            userId: businessData.userId || "",
          });
        }
      } catch (err) {
        console.error("Erro ao buscar dados do negócio:", err);
        setError("Erro ao carregar os dados do negócio. Por favor, tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [auth, id]);

  const updateFormField = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const businessData = {
        nome: formData.business.name,
        cnpj: formData.business.cnpj,
        descricao: formData.business.description,
        categoria: formData.business.category,
        endereco: {
          cep: formData.address.cep,
          rua: formData.address.logradouro,
          bairro: formData.address.bairro,
          cidade: formData.address.cidade,
          estado: formData.address.uf,
          numero: formData.address.numero,
          complemento: formData.address.complemento,
        },
        telefone: formData.contact.telefone,
        cellphone: formData.contact.cellphone,
        email: formData.business.email,
        horarioDeFuncionamento: formData.hours,
        imagens: formData.media.images,
        social: formData.social,
        userId: formData.userId,
        status: formData.status,
        updatedAt: new Date().toISOString(),
      };

      const businessDocRef = doc(db, "lojas", id);
      await updateDoc(businessDocRef, businessData);

      navigate("/meus-negocios");
    } catch (err) {
      console.error("Erro ao atualizar negócio:", err);
      setError("Erro ao salvar alterações. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando dados do negócio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="back-button" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="edit-business">
      <h1>Editar Negócio</h1>

      <form onSubmit={handleSubmit}>
        {/* Informações do Negócio */}
        <section className="form-section">
          <h2>Informações do Negócio</h2>

          <div className="form-group">
            <label htmlFor="businessName">Nome do Negócio*</label>
            <input
              type="text"
              id="businessName"
              value={formData.business.name}
              onChange={(e) =>
                updateFormField("business", "name", e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessCNPJ">CNPJ*</label>
            <InputMask
              mask="99.999.999/9999-99"
              id="businessCNPJ"
              value={formData.business.cnpj}
              onChange={(e) =>
                updateFormField("business", "cnpj", e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessDescription">Descrição*</label>
            <textarea
              id="businessDescription"
              value={formData.business.description}
              onChange={(e) =>
                updateFormField("business", "description", e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessCategory">Categoria*</label>
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
            <label htmlFor="businessEmail">E-mail*</label>
            <input
              type="email"
              id="businessEmail"
              value={formData.business.email}
              onChange={(e) =>
                updateFormField("business", "email", e.target.value)
              }
              required
            />
          </div>
        </section>

        {/* Contato */}
        <section className="form-section">
          <h2>Informações de Contato</h2>

          <div className="form-group">
            <label htmlFor="telefone">Telefone Fixo</label>
            <InputMask
              mask="(99) 9999-9999"
              id="telefone"
              value={formData.contact.telefone}
              onChange={(e) =>
                updateFormField("contact", "telefone", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="cellphone">Celular</label>
            <InputMask
              mask="(99) 99999-9999"
              id="cellphone"
              value={formData.contact.cellphone}
              onChange={(e) =>
                updateFormField("contact", "cellphone", e.target.value)
              }
            />
          </div>
        </section>

        {/* Endereço */}
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
              required
            />
            {loadingCep && <span>Buscando CEP...</span>}
            {errorCep && <span className="error">{errorCep}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="logradouro">Logradouro*</label>
            <input
              type="text"
              id="logradouro"
              value={formData.address.logradouro}
              onChange={(e) =>
                updateFormField("address", "logradouro", e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="numero">Número*</label>
            <input
              type="text"
              id="numero"
              value={formData.address.numero}
              onChange={(e) =>
                updateFormField("address", "numero", e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="complemento">Complemento</label>
            <input
              type="text"
              id="complemento"
              value={formData.address.complemento}
              onChange={(e) =>
                updateFormField("address", "complemento", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="bairro">Bairro*</label>
            <input
              type="text"
              id="bairro"
              value={formData.address.bairro}
              onChange={(e) =>
                updateFormField("address", "bairro", e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cidade">Cidade*</label>
            <input
              type="text"
              id="cidade"
              value={formData.address.cidade}
              onChange={(e) =>
                updateFormField("address", "cidade", e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="uf">Estado*</label>
            <input
              type="text"
              id="uf"
              value={formData.address.uf}
              onChange={(e) => updateFormField("address", "uf", e.target.value)}
              required
            />
          </div>
        </section>

        {/* Horário de Funcionamento */}
        <section className="form-section">
          <h2>Horário de Funcionamento</h2>

          <div className="form-group">
            <h3>Dias de Semana</h3>
            <div className="hours-input">
              <input
                type="time"
                value={formData.hours.weekdays.open}
                onChange={(e) =>
                  updateFormField("hours", "weekdays", {
                    ...formData.hours.weekdays,
                    open: e.target.value,
                  })
                }
              />
              <span>às</span>
              <input
                type="time"
                value={formData.hours.weekdays.close}
                onChange={(e) =>
                  updateFormField("hours", "weekdays", {
                    ...formData.hours.weekdays,
                    close: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <h3>Sábado</h3>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.hours.saturday.closed}
                  onChange={(e) =>
                    updateFormField("hours", "saturday", {
                      ...formData.hours.saturday,
                      closed: e.target.checked,
                    })
                  }
                />
                Fechado
              </label>
            </div>
            {!formData.hours.saturday.closed && (
              <div className="hours-input">
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
                <span>às</span>
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
              </div>
            )}
          </div>

          <div className="form-group">
            <h3>Domingo</h3>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.hours.sunday.closed}
                  onChange={(e) =>
                    updateFormField("hours", "sunday", {
                      ...formData.hours.sunday,
                      closed: e.target.checked,
                    })
                  }
                />
                Fechado
              </label>
            </div>
            {!formData.hours.sunday.closed && (
              <div className="hours-input">
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
                <span>às</span>
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
              </div>
            )}
          </div>

          <div className="form-group">
            <h3>Horário de Almoço</h3>
            <div className="checkbox-group">
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
                Fecha para almoço
              </label>
            </div>
            {formData.hours.lunch.enabled && (
              <div className="hours-input">
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
                <span>às</span>
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
              </div>
            )}
          </div>
        </section>

        {/* Redes Sociais */}
        <section className="form-section">
          <h2>Redes Sociais</h2>

          <div className="form-group">
            <label htmlFor="instagram">Instagram</label>
            <input
              type="text"
              id="instagram"
              value={formData.social.instagram}
              onChange={(e) =>
                updateFormField("social", "instagram", e.target.value)
              }
              placeholder="@seu.instagram"
            />
          </div>

          <div className="form-group">
            <label htmlFor="facebook">Facebook</label>
            <input
              type="text"
              id="facebook"
              value={formData.social.facebook}
              onChange={(e) =>
                updateFormField("social", "facebook", e.target.value)
              }
              placeholder="facebook.com/sua.pagina"
            />
          </div>

          <div className="form-group">
            <label htmlFor="whatsapp">WhatsApp</label>
            <InputMask
            type="text"
              id="whatsapp"
              value={formData.social.whatsapp}
              onChange={(e) =>
                updateFormField("social", "whatsapp", e.target.value)
              }
              placeholder="api.whatsapp/ ou wa.me/"
            />
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBusiness;
