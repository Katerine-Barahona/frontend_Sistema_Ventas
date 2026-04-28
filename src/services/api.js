export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001'

async function parseResponse(response, fallbackMessage) {
  if (response.ok) {
    return response.json()
  }

  let errorMessage = fallbackMessage

  try {
    const errorBody = await response.json()
    errorMessage = errorBody.detail || fallbackMessage
  } catch {
    errorMessage = fallbackMessage
  }

  throw new Error(errorMessage)
}

export async function fetchProducts() {
  const response = await fetch(`${API_URL}/productos/`)
  const data = await parseResponse(response, 'No se pudo obtener el inventario.')

  return data.map((product) => ({
    id: product.id_producto,
    name: product.nombre_producto,
    price: product.precio,
    stock: product.stock,
    category: product.categoria?.nombre || 'Sin categoria',
    sku: `PROD-${String(product.id_producto).padStart(4, '0')}`,
  }))
}

export async function createClient(customerData) {
  const response = await fetch(`${API_URL}/clientes/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerData),
  })

  return parseResponse(response, 'No se pudo registrar el cliente.')
}

export async function registerSale(ventas) {
  const response = await fetch(`${API_URL}/ventas/lote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ventas }),
  })

  return parseResponse(response, 'No se pudo registrar la venta.')
}
