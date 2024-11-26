export const validateForm = ({
  businessName,
  businessCNPJ, // Inclui o CNPJ
  businessDescription,
  category,
  address,
  phone,
  email,
  images,
  cnDoc,
  termsAccepted,
}) => {
  if (
    !businessName ||
    !businessDescription ||
    !category ||
    !address ||
    !phone ||
    !email ||
    images.length === 0 ||
    !cnDoc ||
    !businessCNPJ // Verifica se o CNPJ foi preenchido
  ) {
    return "Todos os campos são obrigatórios!";
  }

  if (!termsAccepted) {
    return "Você precisa aceitar os termos e condições.";
  }

  // Validação do CNPJ
  const cnpjRegex = /^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})-(\d{2})$/;
  if (!cnpjRegex.test(businessCNPJ)) {
    return "CNPJ inválido. O formato deve ser XX.XXX.XXX/XXXX-XX. Exemplo: 12.345.678/0001-99";
  }

  // Validação do telefone (formato (DD) 9XXXX-XXXX)
  const phoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    return "Telefone inválido. O formato deve ser (DD) 9XXXX-XXXX. Exemplo: (11) 98765-4321";
  }

  // Validação do e-mail
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return "E-mail inválido. Exemplo: nome@dominio.com";
  }

  return null;
};
