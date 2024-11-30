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
  const cleanedCNPJ = businessCNPJ.replace(/[^\d]/g, ""); // Remove caracteres não numéricos
  const cnpjRegex = /^[0-9]{14}$/; // Verifica se tem 14 números

  if (!cnpjRegex.test(cleanedCNPJ)) {
    return "CNPJ inválido. Certifique-se de incluir 14 dígitos. Exemplo: 12345678000199";
  }

  // Validação completa do CNPJ (verificando o dígito verificador)
  const validateCNPJ = (cnpj) => {
    let t = cnpj.length - 2;
    let d = cnpj.substring(t);
    let cnpjBody = cnpj.substring(0, t);
    let sum = 0;
    let pos = t - 7;
    for (let i = t; i >= 1; i--) {
      sum += cnpjBody.charAt(t - i) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(d.charAt(0))) return false;
    sum = 0;
    pos = t - 7;
    for (let i = t + 1; i >= 1; i--) {
      sum += cnpjBody.charAt(t - i) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(d.charAt(1))) return false;
    return true;
  };

  if (!validateCNPJ(cleanedCNPJ)) {
    return "CNPJ inválido. O CNPJ informado não é válido.";
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
