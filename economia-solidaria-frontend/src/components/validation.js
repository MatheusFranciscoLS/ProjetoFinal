import { cnpj } from "cpf-cnpj-validator";

export const validateForm = (formData) => {
  const errors = {};

  // Validação do nome
  if (!formData.businessName || formData.businessName.trim().length < 3) {
    errors.businessName = "O nome do negócio deve ter pelo menos 3 caracteres";
  }

  // Validação do CNPJ
  if (!formData.businessCNPJ || !cnpj.isValid(formData.businessCNPJ)) {
    errors.businessCNPJ = "CNPJ inválido.";
  }

  // Validação do telefone fixo
  if (
    formData.telefoneFixo &&
    !/^\(\d{2}\) \d{4}-\d{4}$/.test(formData.telefoneFixo)
  ) {
    errors.telefoneFixo =
      "Telefone fixo inválido. Use o formato (99) 9999-9999";
  }

  // Validação do telefone celular
  if (formData.telefoneCelular && !/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.c)) {
    errors.telefoneCelular =
      "Telefone celular inválido. Use o formato (99) 99999-9999";
  }

  // Validação do email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!formData.email || !emailRegex.test(formData.email)) {
    errors.email = "Email inválido";
  }

  // Validação de imagens
  if (formData.images) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    formData.images.forEach((img) => {
      if (!allowedTypes.includes(img.type)) {
        errors.images = "Formato de imagem inválido. Use JPG, JPEG ou PNG";
      }
      if (img.size > maxSize) {
        errors.images = "Imagem muito grande. Tamanho máximo: 5MB";
      }
    });
  }

  // Validação dos horários de funcionamento
  if (formData.horarioDeFuncionamento) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const diasSemana = ["segundaAsexta", "sabado", "domingo"];

    diasSemana.forEach((dia) => {
      const horarios = formData.horarioDeFuncionamento[dia];
      if (horarios) {
        if (horarios.open && !timeRegex.test(horarios.open)) {
          errors[`horario_${dia}_open`] =
            "Horário de abertura inválido. Use o formato HH:MM";
        }
        if (horarios.close && !timeRegex.test(horarios.close)) {
          errors[`horario_${dia}_close`] =
            "Horário de fechamento inválido. Use o formato HH:MM";
        }
        if (horarios.open && horarios.close) {
          const [openHour, openMin] = horarios.open.split(":").map(Number);
          const [closeHour, closeMin] = horarios.close.split(":").map(Number);
          const openTime = openHour * 60 + openMin;
          const closeTime = closeHour * 60 + closeMin;

          if (closeTime <= openTime) {
            errors[`horario_${dia}`] =
              "Horário de fechamento deve ser após o horário de abertura";
          }
        }
      }
    });
  }

  // Validação das redes sociais (opcional)
  if (formData.socialLinks) {
    const { instagram, facebook, whatsapp } = formData.socialLinks;

    // Validação do Instagram
    if (instagram && !/^https:\/\/www\.instagram\.com\//.test(instagram)) {
      errors.instagram =
        "Link do Instagram inválido. Use o formato https://www.instagram.com/seu_perfil";
    }

    // Validação do Facebook
    if (facebook && !/^https:\/\/www\.facebook\.com\//.test(facebook)) {
      errors.facebook =
        "Link do Facebook inválido. Use o formato https://www.facebook.com/sua_pagina";
    }

    // Validação do WhatsApp
    if (whatsapp) {
      // Verifica se o link começa com "https://wa.me/" ou "https://api.whatsapp.com/send?phone="
      if (
        !/^https:\/\/(wa\.me\/|api\.whatsapp\.com\/send\?phone=)\d+$/.test(
          whatsapp
        )
      ) {
        errors.whatsapp =
          "Link do WhatsApp inválido. Use o formato https://wa.me/seu_numero ou https://api.whatsapp.com/send?phone=seu_numero";
      }
    }
  }

  // Validação da descrição
  if (
    !formData.businessDescription ||
    formData.businessDescription.trim().length < 10
  ) {
    errors.businessDescription =
      "A descrição deve ter pelo menos 10 caracteres";
  }

  // Validação da categoria
  if (!formData.category || formData.category.trim() === "") {
    errors.category = "Selecione uma categoria";
  }

  // Validação do endereço
  if (!formData.address || formData.address.trim().length < 5) {
    errors.address = "Endereço inválido";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const formatCNPJ = (cnpj) => {
  const cleanCNPJ = cnpj.replace(/[^\d]+/g, "");
  return cleanCNPJ.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
};

export const formatPhone = (phone) => {
  const cleanPhone = phone.replace(/[^\d]+/g, "");
  return cleanPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
};

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
