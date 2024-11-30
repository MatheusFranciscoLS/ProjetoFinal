import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Register from "./pages/Register";
import BusinessQuestion from "./pages/BusinessQuestion";
import RegisterBusiness from "./pages/RegisterBusiness";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import Avaliacao from "./pages/Avaliacao";
import LojasList from "./pages/LojaList"; // Importação de LojasList
import LojaDetails from "./pages/LojaDetails"; // Importação de LojaDetails
import EditBusiness from "./pages/EditBusiness"; // Importação de EditBusiness
import MyBusinesses from "./pages/MyBusinesses"; // Atualização para o novo nome
import AdminDashboard from "./pages/AdminDashboard"; // Importação de AdminDashboard
import AdminNegocios from "./pages/AdminNegocios"; // Importação de AdminDashboard
import Terms from "./pages/Terms"; // Página de Termos e Condições
import Profile from "./pages/Profile"; // Importação da página de Perfil
import PlansDetails from "./components/PlansDetails";
import EnderecoDetails from "./pages/EnderecoDetails"; 

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/avaliacao" element={<Avaliacao />} />
        <Route path="/terms" element={<Terms />} /> {/* Página de Termos e Condições */}

        {/* Rotas de registro e login */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Rotas de negócios */}
        <Route path="/business-question" element={<BusinessQuestion />} />
        <Route path="/register-business" element={<RegisterBusiness />} />
        <Route path="/lojas" element={<LojasList />} />
        <Route path="/loja/:id" element={<LojaDetails />} />
        <Route path="/rota-endereco/:endereco" element={<EnderecoDetails />} />

        {/* Rotas administrativas */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-gerenciamento" element={<AdminNegocios />} />
        <Route path="/edit-business/:id" element={<EditBusiness />} />
        <Route path="/meus-negocios" element={<MyBusinesses />} /> {/* Atualizado para MeusNegocios */}
        <Route path="/editar-negocio/:businessId" element={<EditBusiness />} />
        
        {/* Rota de perfil */}
        <Route path="/perfil" element={<Profile />} /> {/* Página de Perfil */}
        <Route path="/plans-details" element={<PlansDetails />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
