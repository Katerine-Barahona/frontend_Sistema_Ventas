import { useState, useEffect } from 'react';
import { Box } from '@mui/material'; 
import ProductTable from '../components/ProductTable';
import CartSummary from '../components/CartSummary';
import SaleForm from '../components/SaleForm';
import { API_URL } from '../services/api';

export default function SalePage() {
  const [productsFromDB, setProductsFromDB] = useState([]);
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({ nombre: '', telefono: '', correo: '' });
  const [loading, setLoading] = useState(true);

  // 1. Cargar productos (PUERTO 8001)
  useEffect(() => {
    fetch(`${API_URL}/productos/`)
      .then(res => res.json())
      .then(data => {
        const mappedProducts = data.map(p => ({
          id: p.id_producto,
          name: p.nombre_producto,
          price: p.precio,
          stock: p.stock,
          category: p.categoria?.nombre || 'Sin categoría'
        }));
        setProductsFromDB(mappedProducts);
        setLoading(false);
      })
      .catch(err => console.error("Error cargando productos:", err));
  }, []);

  const handleAddToCart = (product, quantity) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id 
        ? { ...item, quantity: item.quantity + quantity } : item));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
  };

  const handleSubmitSale = async () => {
    if (cart.length === 0) return alert("El carrito está vacío");

    try {
      // 1. Registrar al cliente (PUERTO 8001)
      const resCliente = await fetch(`${API_URL}/clientes/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(form)
      });
      const clienteCreado = await resCliente.json();

      // 2. Registrar la venta (PUERTO 8001)
      const saleData = {
        id_cliente: clienteCreado.id_cliente,
        detalles: cart.map(item => ({
          id_producto: item.id, 
          cantidad: item.quantity
        }))
      };

      const resVenta = await fetch(`${API_URL}/ventas/lote`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(saleData)
      });

      if (resVenta.ok) {
        alert("✅ ¡Venta guardada con éxito en el puerto 8001!");
        setCart([]); 
        setForm({ nombre: '', telefono: '', correo: '' });
      } else {
        const errorDetail = await resVenta.json();
        alert(`❌ Error: ${errorDetail.detail}`);
      }
    } catch (error) {
      alert("❌ No hay conexión con el servidor en el puerto 8001");
      console.error("Error:", error);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 3, p: 3 }}>
      <Box sx={{ flex: 2 }}>
        <ProductTable 
          products={productsFromDB} 
          cart={cart} 
          loading={loading}
          onAddToCart={handleAddToCart} 
        />
      </Box>
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <CartSummary 
          cart={cart} 
          cliente={form.nombre}
          subtotal={cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}
          total={cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}
          tax={cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) * 0.15}
        />
        <SaleForm 
            form={form} 
            cart={cart}
            onChange={(field, val) => setForm({...form, [field]: val})} 
            onSubmit={handleSubmitSale} 
        />
      </Box>
    </Box>
  );
}
