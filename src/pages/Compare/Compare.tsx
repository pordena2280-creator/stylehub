import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Compare.css';

const Compare = () => {
  const [compareItems, setCompareItems] = useState([
    {
      id: 1,
      name: 'Smartphone Pro Max 256GB',
      price: 1299.99,
      oldPrice: 1499.99,
      image: '/images/products/product-1.jpg',
      rating: 4.8,
      reviews: 156,
      specs: {
        'Marca': 'TechBrand',
        'Pantalla': '6.7" AMOLED 120Hz',
        'Procesador': 'Snapdragon 8 Gen 2',
        'RAM': '12GB',
        'Almacenamiento': '256GB',
        'Cámara': '108MP + 12MP + 10MP',
        'Batería': '5000mAh',
        'Sistema Operativo': 'Android 13',
        'Conectividad': '5G, WiFi 6, BT 5.2',
        'Resistencia': 'IP68',
        'Peso': '228g',
        'Garantía': '1 año',
      }
    },
    {
      id: 2,
      name: 'Smartphone Ultra X 512GB',
      price: 1599.99,
      oldPrice: null,
      image: '/images/products/product-2.jpg',
      rating: 4.6,
      reviews: 89,
      specs: {
        'Marca': 'MegaTech',
        'Pantalla': '6.8" OLED 144Hz',
        'Procesador': 'Dimensity 9200',
        'RAM': '16GB',
        'Almacenamiento': '512GB',
        'Cámara': '200MP + 50MP + 12MP',
        'Batería': '5500mAh',
        'Sistema Operativo': 'Android 13',
        'Conectividad': '5G, WiFi 6E, BT 5.3',
        'Resistencia': 'IP68',
        'Peso': '215g',
        'Garantía': '2 años',
      }
    },
    {
      id: 3,
      name: 'Smartphone Lite 128GB',
      price: 799.99,
      oldPrice: 999.99,
      image: '/images/products/product-3.jpg',
      rating: 4.3,
      reviews: 234,
      specs: {
        'Marca': 'ValueTech',
        'Pantalla': '6.5" LCD 90Hz',
        'Procesador': 'Snapdragon 7 Gen 1',
        'RAM': '8GB',
        'Almacenamiento': '128GB',
        'Cámara': '64MP + 8MP + 5MP',
        'Batería': '4500mAh',
        'Sistema Operativo': 'Android 12',
        'Conectividad': '4G, WiFi 5, BT 5.0',
        'Resistencia': 'IP54',
        'Peso': '195g',
        'Garantía': '1 año',
      }
    },
  ]);

  const removeItem = (id: number) => {
    setCompareItems(prev => prev.filter(item => item.id !== id));
  };

  const specKeys = Object.keys(compareItems[0]?.specs || {});

  const getBestValue = (key: string) => {
    const values = compareItems.map(item => item.specs[key as keyof typeof item.specs]);
    // Simple heuristic: highlight differences
    return values;
  };

  return (
    <div className="compare-page">
      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Inicio</Link>
            <span>/</span>
            <span>Comparar Productos</span>
          </div>
        </div>
      </section>

      <section className="compare-content">
        <div className="container-wide">
          <div className="compare-header">
            <h1>Comparar Productos</h1>
            <p>Compara hasta 4 productos lado a lado</p>
          </div>

          {compareItems.length === 0 ? (
            <div className="empty-compare">
              <span className="empty-icon">⚖️</span>
              <h2>No hay productos para comparar</h2>
              <p>Agrega productos desde el catálogo para compararlos</p>
              <Link to="/products" className="btn-go-products">Ir al Catálogo</Link>
            </div>
          ) : (
            <div className="compare-table-wrap">
              <table className="compare-table">
                {/* Product Headers */}
                <thead>
                  <tr>
                    <th className="spec-label-col">Característica</th>
                    {compareItems.map(item => (
                      <th key={item.id} className="product-col">
                        <div className="compare-product-header">
                          <button className="btn-remove-compare" onClick={() => removeItem(item.id)} title="Quitar">✕</button>
                          <Link to={`/product/${item.id}`}>
                            <img src={item.image} alt={item.name} onError={e => (e.currentTarget.src = 'https://via.placeholder.com/160')} />
                          </Link>
                          <Link to={`/product/${item.id}`} className="compare-product-name">{item.name}</Link>
                          <div className="compare-rating">
                            {'★'.repeat(Math.floor(item.rating))}{'☆'.repeat(5 - Math.floor(item.rating))}
                            <span>({item.reviews})</span>
                          </div>
                          <div className="compare-price">
                            <strong>${item.price.toFixed(2)}</strong>
                            {item.oldPrice && <del>${item.oldPrice.toFixed(2)}</del>}
                          </div>
                          <button className="btn-add-to-cart-compare">
                            🛒 Agregar al Carrito
                          </button>
                        </div>
                      </th>
                    ))}
                    {compareItems.length < 4 && (
                      <th className="add-product-col">
                        <Link to="/products" className="add-product-btn">
                          <span>+</span>
                          <span>Agregar Producto</span>
                        </Link>
                      </th>
                    )}
                  </tr>
                </thead>

                {/* Specs */}
                <tbody>
                  {specKeys.map((key, i) => {
                    const values = getBestValue(key);
                    const allSame = values.every(v => v === values[0]);
                    return (
                      <tr key={key} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                        <td className="spec-label">{key}</td>
                        {compareItems.map((item) => (
                          <td key={item.id} className={`spec-value ${!allSame ? 'highlight' : ''}`}>
                            {item.specs[key as keyof typeof item.specs]}
                          </td>
                        ))}
                        {compareItems.length < 4 && <td></td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {compareItems.length > 0 && (
            <div className="compare-footer">
              <Link to="/products" className="btn-add-more">+ Agregar más productos</Link>
              <button className="btn-clear-compare" onClick={() => setCompareItems([])}>
                🗑️ Limpiar comparación
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Compare;
