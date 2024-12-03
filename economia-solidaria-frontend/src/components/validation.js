// Validação de CNPJ
const validateCNPJ = (cnpj) => {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '');

  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpj)) {
    return false;
  }

  // Validação do primeiro dígito verificador
  let soma = 0;
  let peso = 2;
  for (let i = 11; i >= 0; i--) {
    soma += parseInt(cnpj.charAt(i)) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  let digito = 11 - (soma % 11);
  if (digito > 9) digito = 0;
  if (parseInt(cnpj.charAt(12)) !== digito) {
    return false;
  }

  // Validação do segundo dígito verificador
  soma = 0;
  peso = 2;
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(cnpj.charAt(i)) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  digito = 11 - (soma % 11);
  if (digito > 9) digito = 0;
  if (parseInt(cnpj.charAt(13)) !== digito) {
    return false;
  }

  return true;
};

// Validação de e-mail
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de telefone
const validatePhone = (phone) => {
  // Remove caracteres não numéricos
  phone = phone.replace(/[^\d]/g, '');
  // Verifica se tem 10 (fixo) ou 11 (celular) dígitos
  return phone.length === 10 || phone.length === 11;
};

// Validação de URL
const validateURL = (url) => {
  if (!url) return true; // URLs são opcionais
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validação de horário
const validateTime = (time) => {
  if (!time) return true; // Horários podem ser vazios (exceto segunda a sexta)
  const [hours, minutes] = time.split(':').map(Number);
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
};

// Validação de horário de funcionamento
const validateBusinessHours = (hours) => {
  if (!hours) return { isValid: false, error: 'Horário de funcionamento é obrigatório' };
  
  const { open, close, closed } = hours;
  
  // Se estiver marcado como fechado, não precisa validar horários
  if (closed) {
    return { isValid: true };
  }

  if (!open || !close) {
    return { isValid: false, error: 'Horário de abertura e fechamento são obrigatórios' };
  }

  if (!validateTime(open) || !validateTime(close)) {
    return { isValid: false, error: 'Horário inválido' };
  }

  // Verifica se o horário de fechamento é depois do horário de abertura
  const [openHour, openMinute] = open.split(':').map(Number);
  const [closeHour, closeMinute] = close.split(':').map(Number);
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;

  if (closeTime <= openTime) {
    return { isValid: false, error: 'Horário de fechamento deve ser depois do horário de abertura' };
  }

  return { isValid: true };
};

// Validação de imagens
const validateImageFile = (file) => {
  const errors = [];
  
  // Validar tipo de arquivo
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    errors.push('Tipo de arquivo inválido. Use apenas JPG, PNG ou GIF.');
  }
  
  // Validar tamanho (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('Arquivo muito grande. O tamanho máximo é 5MB.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validação principal do formulário
const validateForm = (formData) => {
  const errors = {};

  // Validar nome do negócio
  if (!formData.nome?.trim()) {
    errors.nome = 'Nome do negócio é obrigatório';
  } else if (formData.nome.length < 3) {
    errors.nome = 'Nome do negócio deve ter pelo menos 3 caracteres';
  }

  // Validar CNPJ
  if (!formData.cnpj) {
    errors.cnpj = 'CNPJ é obrigatório';
  } else if (!validateCNPJ(formData.cnpj)) {
    errors.cnpj = 'CNPJ inválido';
  }

  // Validar descrição
  if (!formData.descricao?.trim()) {
    errors.descricao = 'Descrição é obrigatória';
  } else if (formData.descricao.length < 20) {
    errors.descricao = 'Descrição deve ter pelo menos 20 caracteres';
  }

  // Validar categoria
  if (!formData.categoria) {
    errors.categoria = 'Categoria é obrigatória';
  }

  // Validar endereço
  if (!formData.endereco?.trim()) {
    errors.endereco = 'Endereço é obrigatório';
  }

  // Validar telefone
  if (!formData.telefoneFixo) {
    errors.telefoneFixo = 'Telefone é obrigatório';
  } else if (!validatePhone(formData.telefoneFixo)) {
    errors.telefoneFixo = 'Telefone inválido';
  }

  // Validar celular (opcional)
  if (formData.telefoneCelular && !validatePhone(formData.telefoneCelular)) {
    errors.telefoneCelular = 'Celular inválido';
  }

  // Validar email
  if (!formData.email) {
    errors.email = 'E-mail é obrigatório';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'E-mail inválido';
  }

  // Validar redes sociais
  if (formData.redesSociais) {
    const { instagram, facebook, whatsapp } = formData.redesSociais;
    if (instagram && !validateURL(instagram)) {
      errors.instagram = 'URL do Instagram inválida';
    }
    if (facebook && !validateURL(facebook)) {
      errors.facebook = 'URL do Facebook inválida';
    }
    if (whatsapp && !validateURL(whatsapp)) {
      errors.whatsapp = 'URL do WhatsApp inválida';
    }
  }

  // Validar horário de funcionamento
  if (formData.horarioDeFuncionamento) {
    // Validar horário de segunda a sexta (obrigatório)
    const weekdaysValidation = validateBusinessHours(formData.horarioDeFuncionamento.segundaAsexta);
    if (!weekdaysValidation.isValid) {
      errors.horarioSegundaASexta = weekdaysValidation.error;
    }

    // Validar horário de sábado (opcional)
    if (formData.horarioDeFuncionamento.sabado && !formData.horarioDeFuncionamento.sabado.closed) {
      const saturdayValidation = validateBusinessHours(formData.horarioDeFuncionamento.sabado);
      if (!saturdayValidation.isValid) {
        errors.horarioSabado = saturdayValidation.error;
      }
    }

    // Validar horário de domingo (opcional)
    if (formData.horarioDeFuncionamento.domingo && !formData.horarioDeFuncionamento.domingo.closed) {
      const sundayValidation = validateBusinessHours(formData.horarioDeFuncionamento.domingo);
      if (!sundayValidation.isValid) {
        errors.horarioDomingo = sundayValidation.error;
      }
    }
  } else {
    errors.horarioSegundaASexta = 'Horário de funcionamento é obrigatório';
  }

  // Validar imagens
  if (!formData.imagens || formData.imagens.length === 0) {
    errors.imagens = 'Pelo menos uma imagem é obrigatória';
  }

  // Validar comprovante
  if (!formData.comprovante) {
    errors.comprovante = 'Comprovante do Simples Nacional é obrigatório';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export {
  validateForm,
  validateImageFile,
  validateCNPJ,
  validateEmail,
  validatePhone,
  validateURL,
  validateTime,
  validateBusinessHours
};