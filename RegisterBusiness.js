import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase-config';
import './RegisterBusiness.css';

const MAX_DOC_SIZE = 1048576; // 1MB em bytes
const MAX_IMAGE_SIZE = 300 * 1024; // 300KB em bytes

const RegisterBusiness = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    status: 'pendente',
    createdAt: new Date().toISOString(),
    images: []
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 3) {
      setError('⚠️ Máximo de 3 imagens permitido');
      e.target.value = '';
      return;
    }

    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE) {
        setError(`⚠️ A imagem ${file.name} excede o limite de 300KB. Por favor, use uma imagem de tamanho menor.`);
        e.target.value = '';
        return;
      }
    }

    setLoading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const storageRef = ref(storage, `business-images/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const imageUrls = await Promise.all(uploadPromises);
      
      setFormData(prevState => ({
        ...prevState,
        images: [...prevState.images, ...imageUrls].slice(-3)
      }));

      setError('');
    } catch (err) {
      setError('Erro ao fazer upload das imagens. Tente novamente.');
      console.error('Erro no upload:', err);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const docSize = new TextEncoder().encode(JSON.stringify(formData)).length;
      console.log('Tamanho do documento:', docSize);
      
      if (docSize > MAX_DOC_SIZE) {
        setError('⚠️ Limite de tamanho do documento ultrapassado! Por favor, use imagens de tamanho menor.');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "negocios_pendentes"), formData);
      navigate('/dashboard');
    } catch (err) {
      setError('Ocorreu um erro ao registrar o negócio. Por favor, tente novamente.');
      console.error('Error adding document: ', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-business-container">
      <h2>Registrar Novo Negócio</h2>
      {error && <div className="error-message" style={{ 
        backgroundColor: error.includes('⚠️') ? '#fff3cd' : '#f8d7da',
        color: error.includes('⚠️') ? '#856404' : '#721c24',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem'
      }}>
        {error}
      </div>}
      
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="businessName">Nome do Negócio *</label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cnpj">CNPJ *</label>
          <input
            type="text"
            id="cnpj"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Endereço *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Telefone *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descrição do Negócio</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="images">
            Imagens do Negócio (máx. 3 imagens, 300KB cada)
          </label>
          <input
            type="file"
            id="images"
            name="images"
            onChange={handleImageUpload}
            multiple
            accept="image/*"
            disabled={loading}
          />
          {formData.images.length > 0 && (
            <div className="uploaded-images-count">
              {formData.images.length} imagem(ns) carregada(s)
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Processando...' : 'Registrar Negócio'}
        </button>
      </form>
    </div>
  );
};

export default RegisterBusiness;
