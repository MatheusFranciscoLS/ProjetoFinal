export const validateForm = ({
  businessName,
  businessCNPJ,
  businessDescription,
  category,
  address,
  landline,
  email,
  images,
  cnDoc,
  termsAccepted,
}) => {
  if (!businessName) return "O nome do negócio é obrigatório!";
  if (!businessDescription) return "A descrição do negócio é obrigatória!";
  if (!category) return "A categoria é obrigatória!";
  if (!address) return "O endereço é obrigatório!";
  if (!landline) return "O telefone é obrigatório!";
  if (!email) return "O e-mail é obrigatório!";
  if (images.length === 0) return "Pelo menos uma imagem é obrigatória!";
  if (!cnDoc) return "O comprovante do Simples Nacional é obrigatório!";
  if (!businessCNPJ) return "O CNPJ é obrigatório!";

  // Verificação dos termos
  if (!termsAccepted) {
    return "Você precisa aceitar os termos e condições.";
  }

  // Validação do CNPJ
  const cleanedCNPJ = businessCNPJ.replace(/[^\d]/g, "");
  const cnpjRegex = /^[0-9]{14}$/;
  if (!cnpjRegex.test(cleanedCNPJ)) {
    return "CNPJ inválido. Certifique-se de incluir 14 dígitos. Exemplo: 12345678000199";
  }

  // Validação completa do CNPJ (verificação dos dígitos verificadores)
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

  // Validação do telefone (11 dígitos)
  const cleanedLandline = landline.replace(/[^\d]/g, "");
  const LandlineRegex = /^[0-9]{10}$/;
  if (!LandlineRegex.test(cleanedLandline)) {
    return "Telefone fixo inválido. Certifique-se de incluir 11 dígitos. Exemplo: 11987654321";
  }

  // Validação do e-mail
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return "E-mail inválido. Exemplo: nome@dominio.com";
  }

  return null; // Se não houver erros
};
