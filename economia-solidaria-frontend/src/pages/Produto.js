import React from "react";
import "../styles/produto.css";

const Products = () => {
  const products = [
    { id: 1, name: "Produto 1", description: "Descrição do Produto 1", price: "R$ 50,00", image: "https://via.placeholder.com/200" },
    { id: 2, name: "Produto 2", description: "Descrição do Produto 2", price: "R$ 75,00", image: "https://via.placeholder.com/200" },
    { id: 3, name: "Produto 3", description: "Descrição do Produto 3", price: "R$ 100,00", image: "https://via.placeholder.com/200" },
    { id: 4, name: "Produto 4", description: "Descrição do Produto 4", price: "R$ 120,00", image: "https://via.placeholder.com/200" },
  ];

  return (
    <div className="products-container">
      <h1>Produtos</h1>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <h3 className="product-name">{product.name}</h3>
            <p className="product-description">{product.description}</p>
            <p className="product-price">{product.price}</p>
            <button className="product-button">Comprar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
