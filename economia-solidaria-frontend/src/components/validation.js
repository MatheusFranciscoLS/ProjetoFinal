import { cnpj } from "cpf-cnpj-validator";

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
  console.log("Dados recebidos:", {
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
  });

  if (!businessName) return "O nome do negócio é obrigatório!";
  if (!businessDescription) return "A descrição do negócio é obrigatória!";
  if (!category) return "A categoria é obrigatória!";
  if (!address) return "O endereço é obrigatório!";
  if (!landline) return "O telefone é obrigatório!";
  if (!email) return "O e-mail é obrigatório!";
  if (images.length === 0) return "Pelo menos uma imagem é obrigatória!";
  if (!cnDoc) return "O comprovante do Simples Nacional é obrigatório!";
  if (!businessCNPJ) return "O CNPJ é obrigatório!";

  if (!termsAccepted) {
    return "Você precisa aceitar os termos e condições.";
  }

  // Validação do CNPJ
  const cleanedCNPJ = businessCNPJ.replace(/[^\d]/g, ""); // Remove qualquer caractere não numérico
  console.log("CNPJ limpo:", cleanedCNPJ); // Log para verificar o CNPJ limpo

  if (!cnpj.isValid(cleanedCNPJ)) {
    return "CNPJ inválido. O CNPJ informado não é válido.";
  }

  // Validação do telefone (10 dígitos)
  const cleanedLandline = landline.replace(/[^\d]/g, "");
  const landlineRegex = /^[0-9]{10}$/;
  if (!landlineRegex.test(cleanedLandline)) {
    return "Telefone fixo inválido. Certifique-se de incluir 10 dígitos. Exemplo: 11987654321";
  }

  // Validação do e-mail
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return "E-mail inválido. Exemplo: nome@dominio.com";
  }

  return null; // Se não houver erros
};
