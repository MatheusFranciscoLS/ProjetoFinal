import { cnpj } from "cpf-cnpj-validator";

// Validação de imagens
export const validateImageFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Formato de arquivo inválido. Use JPG, JPEG ou PNG",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "Arquivo muito grande. Tamanho máximo: 5MB",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

// Formatação de CNPJ
export const formatCNPJ = (cnpj) => {
  const cleanCNPJ = cnpj.replace(/[^\d]+/g, "");
  return cleanCNPJ.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
};

// Formatação de telefone
export const formatPhone = (phone) => {
  const cleanPhone = phone.replace(/[^\d]+/g, "");
  return cleanPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
};

// Validação de horário
const validateTime = (time) => {
  if (!time) return true;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Validação de horário de almoço
const validateLunchBreak = (lunchBreak, businessHours) => {
  if (!lunchBreak || lunchBreak.isClosed) return { isValid: true };

  const { start, end } = lunchBreak;

  if (!start || !end) {
    return { isValid: false, error: "Horário de almoço deve ter início e fim" };
  }

  if (!validateTime(start) || !validateTime(end)) {
    return { isValid: false, error: "Horário de almoço inválido" };
  }

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  if (endTime <= startTime) {
    return {
      isValid: false,
      error: "Horário de fim do almoço deve ser depois do início",
    };
  }

  // Validar se o horário de almoço está dentro do horário de funcionamento
  if (businessHours && !businessHours.closed) {
    const [businessOpenHour, businessOpenMinute] = businessHours.open
      .split(":")
      .map(Number);
    const [businessCloseHour, businessCloseMinute] = businessHours.close
      .split(":")
      .map(Number);
    const businessOpenTime = businessOpenHour * 60 + businessOpenMinute;
    const businessCloseTime = businessCloseHour * 60 + businessCloseMinute;

    if (startTime < businessOpenTime) {
      return {
        isValid: false,
        error:
          "Horário de início do almoço deve ser depois do horário de abertura",
      };
    }

    if (endTime > businessCloseTime) {
      return {
        isValid: false,
        error:
          "Horário de fim do almoço deve ser antes do horário de fechamento",
      };
    }
  }

  return { isValid: true };
};

// Validação de horário de funcionamento
const validateBusinessHours = (hours) => {
  if (!hours)
    return { isValid: false, error: "Horário de funcionamento é obrigatório" };

  const { open, close, closed } = hours;

  if (closed) {
    return { isValid: true };
  }

  if (!open || !close) {
    return {
      isValid: false,
      error: "Horário de abertura e fechamento são obrigatórios",
    };
  }

  if (!validateTime(open) || !validateTime(close)) {
    return { isValid: false, error: "Horário inválido" };
  }

  const [openHour, openMinute] = open.split(":").map(Number);
  const [closeHour, closeMinute] = close.split(":").map(Number);
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;

  if (closeTime <= openTime) {
    return {
      isValid: false,
      error: "Horário de fechamento deve ser depois do horário de abertura",
    };
  }

  return { isValid: true };
};

// Validação principal do formulário
export const validateForm = (formData) => {
  const errors = {};

  // Validar nome do negócio
  if (!formData.nome || formData.nome.trim() === "") {
    errors.nome = "O nome do negócio é obrigatório.";
  } else if (formData.nome.trim().length < 5) {
    errors.nome = "O nome do negócio deve ter pelo menos 5 caracteres.";
  }

  // Validar CNPJ
  if (!formData.cnpj || !cnpj.isValid(formData.cnpj)) {
    errors.cnpj = "O CNPJ é obrigatório e deve ser válido.";
  }

  // Validar descrição
  if (!formData.descricao || formData.descricao.trim() === "") {
    errors.descricao = "A descrição é obrigatória.";
  } else if (formData.descricao.split(" ").length < 2) {
    errors.descricao = "A descrição deve ter pelo menos 2 palavras.";
  }

  // Validar categoria
  if (!formData.categoria || formData.categoria.trim() === "") {
    errors.categoria = "A categoria é obrigatória.";
  }

  // Validar endereço
  if (!formData.endereco || formData.endereco.trim() === "") {
    errors.endereco = "O endereço é obrigatório.";
  }

  // Validar telefone fixo
  const telefoneFixo = formData.telefoneFixo
    ? formData.telefoneFixo.replace(/\D/g, "")
    : "";
  if (!telefoneFixo || telefoneFixo.length !== 10) {
    errors.telefoneFixo = "Telefone fixo obrigatório e deve ser válido.";
  }

  // Validar celular (opcional e válido)
  const telefoneCelular = formData.telefoneCelular
    ? formData.telefoneCelular.replace(/\D/g, "")
    : "";
  if (telefoneCelular && telefoneCelular.length !== 11) {
    errors.telefoneCelular = "Telefone celular, se informado, deve ser válido.";
  }

  // Validar horário de funcionamento
  if (formData.horarioDeFuncionamento) {
    const diasSemana = ["segundaAsexta", "sabado", "domingo"];
    diasSemana.forEach((dia) => {
      const horarios = formData.horarioDeFuncionamento[dia];
      if (horarios) {
        const result = validateBusinessHours(horarios);
        if (!result.isValid) {
          errors[dia] = result.error;
        }
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
