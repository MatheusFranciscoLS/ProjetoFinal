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

  // Validação do CNPJ (aceita números puros)
  const cleanedCNPJ = businessCNPJ.replace(/[^\d]/g, ""); // Remove caracteres não numéricos
  const cnpjRegex = /^[0-9]{14}$/; // Verifica se tem 14 números

  if (!cnpjRegex.test(cleanedCNPJ)) {
    return "CNPJ inválido. Certifique-se de incluir 14 dígitos. Exemplo: 12345678000199";
  }

  // Validação do telefone (aceita números puros com 11 dígitos)
  const cleanedPhone = phone.replace(/[^\d]/g, ""); // Remove caracteres não numéricos
  const phoneRegex = /^[0-9]{11}$/; // Verifica se tem 11 números (formato limpo)

  if (!phoneRegex.test(cleanedPhone)) {
    return "Telefone inválido. Certifique-se de incluir 11 dígitos. Exemplo: 11987654321 ou (11) 98765-4321";
  }

  // Validação do e-mail
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return "E-mail inválido. Exemplo: nome@dominio.com";
  }

  return null;
};
