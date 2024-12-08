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
import Avaliacao from "./components/Avaliacao";
import LojasList from "./pages/LojaList";
import LojaDetails from "./pages/LojaDetails";
import EditBusiness from "./pages/EditBusiness";
import MyBusinesses from "./pages/MyBusinesses";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNegocios from "./pages/AdminNegocios";
import Terms from "./pages/Terms";
import Profile from "./pages/Profile";
import PlansDetails from "./components/PlansDetails";
import EnderecoDetails from "./pages/EnderecoDetails";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from './components/AdminRoute';

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/business-question" element={<BusinessQuestion />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/avaliacao" element={<Avaliacao />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/lojas" element={<LojasList />} />
        <Route path="/loja/:id" element={<LojaDetails />} />
        <Route path="/plans-details" element={<PlansDetails />} />

        {/* Rotas de registro e login */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />


        {/* Rotas protegidas */}
        <Route path="/register-business" element={
          <PrivateRoute>
            <RegisterBusiness />
          </PrivateRoute>
        } />
        <Route path="/meus-negocios" element={
          <PrivateRoute>
            <MyBusinesses />
          </PrivateRoute>
        } />
        <Route path="/edit-business/:id" element={
          <PrivateRoute>
            <EditBusiness />
          </PrivateRoute>
        } />
        <Route path="/rota-endereco/:endereco" element={
          <PrivateRoute>
            <EnderecoDetails />
          </PrivateRoute>
        } />
        <Route path="/perfil" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/plans-details" element={
          <PrivateRoute>
            <PlansDetails />
          </PrivateRoute>
        } />

        {/* Rotas administrativas */}
        <Route path="/admin-dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin-gerenciamento" element={
          <AdminRoute>
            <AdminNegocios />
          </AdminRoute>
        } />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
