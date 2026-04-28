import { useEffect, useMemo, useState } from 'react'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import CartSummary from './components/CartSummary'
import ProductTable from './components/ProductTable'
import SaleForm from './components/SaleForm'
import { API_URL, createClient, fetchProducts, registerSale } from './services/api'

const defaultForm = {
  customer: '',
  document: '',
  paymentMethod: '',
  notes: '',
}

const TAX_RATE = 0.15
const SALE_YEAR = new Date().getFullYear()

export default function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [quantities, setQuantities] = useState({})
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState({ text: '', severity: 'success' })
  const [saleNumber, setSaleNumber] = useState(1)
  const [currentStep, setCurrentStep] = useState('customer')
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [submittingSale, setSubmittingSale] = useState(false)
  const [loadError, setLoadError] = useState('')

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  )
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  const saleCode = useMemo(() => {
    const sequence = String(saleNumber).padStart(3, '0')
    return `VTA-${SALE_YEAR}-${sequence}`
  }, [saleNumber])

  const loadProducts = async () => {
    setLoadingProducts(true)
    setLoadError('')

    try {
      const apiProducts = await fetchProducts()
      setProducts(apiProducts)
    } catch (error) {
      const message = error.message || 'No se pudo cargar el inventario desde el backend.'
      setProducts([])
      setLoadError(message)
      setFeedback({
        text: message,
        severity: 'error',
      })
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const getProductById = (productId) =>
    products.find((product) => product.id === productId)

  const updateQuantityDraft = (productId, value) => {
    setQuantities((current) => ({
      ...current,
      [productId]: value < 1 ? 1 : value,
    }))
  }

  const addToCart = (product, requestedQuantity, onlyDraft = false) => {
    const currentQuantity = cart.find((item) => item.id === product.id)?.quantity ?? 0
    const availableStock = product.stock - currentQuantity
    const safeQuantity = Math.max(1, Number.isFinite(requestedQuantity) ? requestedQuantity : 1)
    const boundedQuantity = Math.min(safeQuantity, availableStock || 1)

    updateQuantityDraft(product.id, boundedQuantity)

    if (onlyDraft) {
      return
    }

    if (availableStock === 0) {
      setFeedback({
        text: `"${product.name}" ya no tiene stock disponible.`,
        severity: 'error',
      })
      return
    }

    setCart((current) => {
      const existingItem = current.find((item) => item.id === product.id)

      if (existingItem) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + boundedQuantity, product.stock),
              }
            : item,
        )
      }

      return [...current, { ...product, quantity: boundedQuantity }]
    })

    setQuantities((current) => ({
      ...current,
      [product.id]: 1,
    }))
  }

  const increaseItem = (productId) => {
    setCart((current) =>
      current.map((item) => {
        if (item.id !== productId) {
          return item
        }

        const source = getProductById(productId)
        const nextQuantity = Math.min(item.quantity + 1, source.stock)
        return { ...item, quantity: nextQuantity }
      }),
    )
  }

  const decreaseItem = (productId) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (productId) => {
    setCart((current) => current.filter((item) => item.id !== productId))
  }

  const handleFormChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validateCustomerStep = () => {
    const nextErrors = {}

    if (!form.customer.trim()) {
      nextErrors.customer = 'Ingresa el nombre del cliente para continuar.'
    }

    setErrors((current) => ({ ...current, ...nextErrors }))
    return Object.keys(nextErrors).length === 0
  }

  const handleContinueToProducts = () => {
    if (!validateCustomerStep()) {
      return
    }

    setCurrentStep('products')
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!form.customer.trim()) {
      nextErrors.customer = 'Ingresa el nombre del cliente.'
    }

    if (!form.document.trim()) {
      nextErrors.document = 'Ingresa una identidad o RTN.'
    }

    if (!form.paymentMethod) {
      nextErrors.paymentMethod = 'Selecciona un metodo de pago.'
    }

    if (cart.length === 0) {
      setFeedback({
        text: 'Agrega al menos un producto antes de registrar la venta.',
        severity: 'warning',
      })
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0 && cart.length > 0
  }

  const handleSubmitSale = async () => {
    if (!validateForm()) {
      return
    }

    setSubmittingSale(true)

    try {
      const customer = await createClient({
        nombre: form.customer.trim(),
        telefono: form.document.trim() || null,
        correo: null,
      })

      await registerSale([
        {
          id_cliente: customer.id_cliente,
          detalles: cart.map((item) => ({
            id_producto: item.id,
            cantidad: item.quantity,
          })),
        },
      ])

      const refreshedProducts = await fetchProducts()

      setProducts(refreshedProducts)
      setCart([])
      setQuantities({})
      setForm(defaultForm)
      setErrors({})
      setSaleNumber((current) => current + 1)
      setCurrentStep('customer')
      setFeedback({
        text: `Venta registrada correctamente. Total facturado: L ${total.toFixed(2)}`,
        severity: 'success',
      })
    } catch (error) {
      setFeedback({
        text: error.message || 'No se pudo registrar la venta en el backend.',
        severity: 'error',
      })
    } finally {
      setSubmittingSale(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 4, md: 6 },
        background:
          'radial-gradient(circle at top left, rgba(15, 118, 110, 0.18), transparent 35%), radial-gradient(circle at top right, rgba(249, 115, 22, 0.12), transparent 30%), #f4f7f5',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: 6,
            bgcolor: '#0b1f1d',
            color: '#f5fffd',
            boxShadow: '0 24px 60px rgba(11, 31, 29, 0.18)',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                <StorefrontRoundedIcon />
                <Typography variant="overline" sx={{ color: 'rgba(245, 255, 253, 0.72)' }}>
                  Frontend sistema de ventas
                </Typography>
              </Stack>
              <Typography variant="h3" sx={{ maxWidth: 700 }}>
                {currentStep === 'customer'
                  ? 'Primero registra el cliente y luego agrega productos.'
                  : 'Agrega productos al carrito .'}
              </Typography>
              <Typography
                variant="body1"
                sx={{ mt: 1.5, maxWidth: 720, color: 'rgba(245, 255, 253, 0.8)' }}
              >
                {currentStep === 'customer'
                  ? 'Flujo simplificado para iniciar cada venta con el cliente y mantener el proceso mas claro.'
                  : 'Cliente activo, inventario visible y carrito dinamico para capturar la venta de forma rapida.'}
              </Typography>
            </Box>

            <Alert
              icon={<PointOfSaleRoundedIcon fontSize="inherit" />}
              severity="success"
              sx={{
                minWidth: { xs: '100%', md: 280 },
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: 'inherit',
                '& .MuiAlert-icon': { color: '#86efac' },
              }}
            >
              {loadingProducts
                ? 'Cargando inventario del backend...'
                : `Inventario disponible: ${products.reduce((sum, item) => sum + item.stock, 0)} unidades`}
            </Alert>
          </Stack>
        </Box>

        {loadError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={loadProducts}>
                Reintentar
              </Button>
            }
            sx={{ mb: 3 }}
          >
            {loadError} URL actual: {API_URL}
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            API actual: {API_URL}
          </Alert>
        )}

        {currentStep === 'customer' ? (
          <SaleForm
            mode="customer"
            form={form}
            errors={errors}
            cart={cart}
            total={total}
            saleCode={saleCode}
            onChange={handleFormChange}
            onContinue={handleContinueToProducts}
          />
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert
                severity="info"
                action={
                  <Button color="inherit" size="small" onClick={() => setCurrentStep('customer')}>
                    Editar cliente
                  </Button>
                }
              >
                Venta para <strong>{form.customer}</strong>
                {form.document ? ` - Documento: ${form.document}` : ''}
              </Alert>
            </Grid>

            <Grid item xs={12} lg={8}>
              <ProductTable
                products={products}
                quantities={quantities}
                cart={cart}
                loading={loadingProducts}
                onAddToCart={addToCart}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <CartSummary
                cart={cart}
                subtotal={subtotal}
                tax={tax}
                total={total}
                cliente={form.customer}
                onIncrease={increaseItem}
                onDecrease={decreaseItem}
                onRemove={removeItem}
              />
            </Grid>

            <Grid item xs={12}>
              <SaleForm
                form={form}
                errors={errors}
                cart={cart}
                total={total}
                saleCode={saleCode}
                onChange={handleFormChange}
                onBack={() => setCurrentStep('customer')}
                onSubmit={handleSubmitSale}
                isSubmitting={submittingSale}
              />
            </Grid>
          </Grid>
        )}

        <Snackbar
          open={Boolean(feedback.text)}
          autoHideDuration={3500}
          onClose={() => setFeedback({ text: '', severity: 'success' })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={feedback.severity}
            variant="filled"
            onClose={() => setFeedback({ text: '', severity: 'success' })}
          >
            {feedback.text}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}
