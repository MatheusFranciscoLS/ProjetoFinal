import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/EditBusiness.css";

const EditBusinessModal = ({ businessId, businessData, onClose }) => {
  const [businessName, setBusinessName] = useState(businessData.nome || "");
  const [businessCNPJ, setBusinessCNPJ] = useState(businessData.cnpj || "");
  const [businessDescription, setBusinessDescription] = useState(businessData.descricao || "");
  const [category, setCategory] = useState(businessData.categoria || "");
  const [address, setAddress] = useState(businessData.endereco || "");
  const [phoneFixed, setPhoneFixed] = useState(businessData.telefoneFixo || "");
  const [phoneMobile, setPhoneMobile] = useState(businessData.telefoneCelular || "");
  const [email, setEmail] = useState(businessData.email || "");
  const [instagram, setInstagram] = useState(businessData.redesSociais?.instagram || "");
  const [facebook, setFacebook] = useState(businessData.redesSociais?.facebook || "");
  const [whatsapp, setWhatsapp] = useState(businessData.redesSociais?.whatsapp || "");
  const [workingHoursWeek, setWorkingHoursWeek] = useState(
    businessData.horarioDeFuncionamento?.segundaAsexta?.open || ""
  );
  const [workingHoursWeekClose, setWorkingHoursWeekClose] = useState(
    businessData.horarioDeFuncionamento?.segundaAsexta?.close || ""
  );
  const [workingHoursSat, setWorkingHoursSat] = useState(
    businessData.horarioDeFuncionamento?.sabado?.open || ""
  );
  const [workingHoursSatClose, setWorkingHoursSatClose] = useState(
    businessData.horarioDeFuncionamento?.sabado?.close || ""
  );
  const [workingHoursSun, setWorkingHoursSun] = useState(
    businessData.horarioDeFuncionamento?.domingo?.open || ""
  );
  const [workingHoursSunClose, setWorkingHoursSunClose] = useState(
    businessData.horarioDeFuncionamento?.domingo?.close || ""
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newBusinessRef = doc(db, "lojas", businessId);

    try {
      // Preserve existing fields and update only the ones we're editing
      const updatedData = {
        ...businessData,
        nome: businessName,
        cnpj: businessCNPJ,
        descricao: businessDescription,
        categoria: category,
        endereco: address,
        telefoneFixo: phoneFixed,
        telefoneCelular: phoneMobile,
        email: email,
        redesSociais: {
          instagram: instagram,
          facebook: facebook,
          whatsapp: whatsapp
        },
        horarioDeFuncionamento: {
          segundaAsexta: {
            open: workingHoursWeek,
            close: workingHoursWeekClose
          },
          sabado: {
            open: workingHoursSat,
            close: workingHoursSatClose
          },
          domingo: {
            open: workingHoursSun,
            close: workingHoursSunClose
          }
        }
      };

      await updateDoc(newBusinessRef, updatedData);
      alert("Loja atualizada com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar loja: ", error);
      alert("Ocorreu um erro ao atualizar a loja.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Loja</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nome:</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>CNPJ:</label>
            <input
              type="text"
              value={businessCNPJ}
              onChange={(e) => setBusinessCNPJ(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Descrição:</label>
            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Categoria:</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Endereço:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Telefone Fixo:</label>
            <input
              type="text"
              value={phoneFixed}
              onChange={(e) => setPhoneFixed(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Telefone Celular:</label>
            <input
              type="text"
              value={phoneMobile}
              onChange={(e) => setPhoneMobile(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>E-mail:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="social-media-section">
            <h3>Redes Sociais</h3>
            <div className="input-group">
              <label>Instagram:</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Facebook:</label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>WhatsApp:</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>
          </div>

          <div className="working-hours-section">
            <h3>Horário de Funcionamento</h3>
            <div className="working-hours-group">
              <h4>Segunda a Sexta</h4>
              <div className="hours-input-group">
                <div className="input-group">
                  <label>Abertura:</label>
                  <input
                    type="time"
                    value={workingHoursWeek}
                    onChange={(e) => setWorkingHoursWeek(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Fechamento:</label>
                  <input
                    type="time"
                    value={workingHoursWeekClose}
                    onChange={(e) => setWorkingHoursWeekClose(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="working-hours-group">
              <h4>Sábado</h4>
              <div className="hours-input-group">
                <div className="input-group">
                  <label>Abertura:</label>
                  <input
                    type="time"
                    value={workingHoursSat}
                    onChange={(e) => setWorkingHoursSat(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Fechamento:</label>
                  <input
                    type="time"
                    value={workingHoursSatClose}
                    onChange={(e) => setWorkingHoursSatClose(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="working-hours-group">
              <h4>Domingo</h4>
              <div className="hours-input-group">
                <div className="input-group">
                  <label>Abertura:</label>
                  <input
                    type="time"
                    value={workingHoursSun}
                    onChange={(e) => setWorkingHoursSun(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Fechamento:</label>
                  <input
                    type="time"
                    value={workingHoursSunClose}
                    onChange={(e) => setWorkingHoursSunClose(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="buttons">
            <button type="submit" className="btn primary">Atualizar</button>
            <button type="button" onClick={onClose} className="btn secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBusinessModal;
