import { cnpj } from "cpf-cnpj-validator";
import { db } from "../firebase"; // Certifique-se de que o Firestore está configurado corretamente
import { collection, query, where, getDocs } from "firebase/firestore";

// Função para verificar se o CNPJ já existe no Firestore
const checkIfCNPJExists = async (cnpjValue) => {
  try {
    const formattedCNPJ = cnpjValue.replace(/[^\d]/g, ""); // Remove caracteres não numéricos
    const cnpjsRef = collection(db, "businesses"); // Nome da coleção onde os negócios estão armazenados
    const q = query(cnpjsRef, where("cnpj", "==", formattedCNPJ));
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty; // Retorna `true` se encontrar um CNPJ
  } catch (error) {
    console.error("Erro ao verificar CNPJ:", error);
    throw new Error("Erro ao verificar o CNPJ. Tente novamente.");
  }
};

// Validação de imagens
export const validateImageFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error:
        "O formato do arquivo é inválido. Por favor, utilize arquivos nos formatos JPG, JPEG ou PNG.",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "O arquivo é muito grande. O tamanho máximo permitido é de 5MB.",
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

// Validação de horário de funcionamento
const validateBusinessHours = (hours) => {
  if (!hours)
    return {
      isValid: false,
      error:
        "O horário de funcionamento é obrigatório. Por favor, preencha os horários de abertura e fechamento.",
    };

  const { open, close, closed } = hours;

  if (closed) {
    return { isValid: true };
  }

  if (!open || !close) {
    return {
      isValid: false,
      error: "Os campos de horário de abertura e fechamento são obrigatórios.",
    };
  }

  if (!validateTime(open) || !validateTime(close)) {
    return {
      isValid: false,
      error: "Os horários informados são inválidos. Verifique o formato.",
    };
  }

  const [openHour, openMinute] = open.split(":").map(Number);
  const [closeHour, closeMinute] = close.split(":").map(Number);
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;

  if (closeTime <= openTime) {
    return {
      isValid: false,
      error:
        "O horário de fechamento deve ser posterior ao horário de abertura.",
    };
  }

  return { isValid: true };
};

// Validação principal do formulário
export const validateForm = async (formData) => {
  const errors = {};

  // Validação de nome do negócio
  if (!formData.nome || formData.nome.trim() === "") {
    errors.nome =
      "Por favor, insira o nome do negócio. Ele deve ter pelo menos 5 caracteres.";
  } else if (formData.nome.trim().length < 5) {
    errors.nome =
      "Por favor, insira o nome do negócio. Ele deve ter pelo menos 5 caracteres.";
  }

  // Validação de CNPJ
if (!formData.cnpj || !cnpj.isValid(formData.cnpj)) {
    errors.cnpj =
      "O CNPJ informado é inválido. Certifique-se de fornecer um CNPJ válido.";
  } else {
    try {
      const exists = await checkIfCNPJExists(formData.cnpj);
      if (exists) {
        errors.cnpj = "O CNPJ informado já está registrado na plataforma.";
      }
    } catch (error) {
      errors.cnpj =
        "Não foi possível verificar o CNPJ no momento. Tente novamente.";
    }
  }

  // Validação de descrição
  if (!formData.descricao || formData.descricao.trim() === "") {
    errors.descricao =
      "A descrição do seu negócio é obrigatória e deve conter ao menos duas palavras.";
  } else if (formData.descricao.split(" ").length < 2) {
    errors.descricao =
      "A descrição do seu negócio é obrigatória e deve conter ao menos duas palavras.";
  }

  // Validação de categoria
  if (!formData.categoria || formData.categoria.trim() === "") {
    errors.categoria =
      "A categoria do negócio é obrigatória. Por favor, selecione uma opção.";
  }

  // Validação de endereço
  if (!formData.endereco || formData.endereco.trim() === "") {
    errors.endereco =
      "O endereço do seu negócio é obrigatório. Por favor, forneça o endereço completo.";
  }

  // Validação de telefone fixo
  const telefoneFixo = formData.telefoneFixo
    ? formData.telefoneFixo.replace(/\D/g, "")
    : "";
  if (!telefoneFixo || telefoneFixo.length !== 10) {
    errors.telefoneFixo =
      "Por favor, informe um número de telefone fixo válido, incluindo o DDD (ex: 11 1234-5678).";
  }

  // Validação de celular (opcional e válido)
  const telefoneCelular = formData.telefoneCelular
    ? formData.telefoneCelular.replace(/\D/g, "")
    : "";
  if (telefoneCelular && telefoneCelular.length !== 11) {
    errors.telefoneCelular =
      "Caso tenha informado um número de celular, ele deve ser válido e incluir o DDD (ex: 11 91234-5678).";
  }

  // Validação de horário de funcionamento
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

  // Validação de imagens (mínimo 1 imagens)
  if (
    !formData.imagens ||
    !Array.isArray(formData.imagens) ||
    formData.imagens.length < 1
  ) {
    errors.imagens =
      "Por favor, envie pelo menos uma imagens do seu negócio. Imagens com boa resolução são recomendadas.";
  }

  // Validação de comprovante
  if (!formData.comprovante || !(formData.comprovante instanceof File)) {
    errors.comprovante =
      "O comprovante do Simples Nacional é obrigatório para concluir o cadastro. Por favor, anexe o documento.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
