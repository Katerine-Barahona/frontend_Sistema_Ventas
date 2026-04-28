import { useMemo, useState } from 'react'
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { formatCurrency } from '../utils/currency'

const getStockLabel = (stock) => {
  if (stock === 0) {
    return { label: 'Sin stock', color: 'error' }
  }

  if (stock <= 5) {
    return { label: 'Stock bajo', color: 'warning' }
  }

  return { label: 'Disponible', color: 'success' }
}

export default function ProductTable({
  products,
  quantities,
  cart,
  loading = false,
  onAddToCart,
}) {
  const [search, setSearch] = useState('')

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return products
    }

    return products.filter((product) =>
      [product.name, product.category, product.sku].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [products, search])

  const getReservedQuantity = (productId) =>
    cart.find((item) => item.id === productId)?.quantity ?? 0

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            Tabla de productos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consulta el inventario y agrega articulos al carrito en segundos.
          </Typography>
        </Box>

        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          placeholder="Buscar por nombre, categoria o SKU"
          sx={{ minWidth: { xs: '100%', md: 320 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              
              <TableCell>Categoria</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="center">Stock</TableCell>
              <TableCell align="center">Cantidad</TableCell>
              <TableCell align="right">Accion</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading &&
              filteredProducts.map((product) => {
              const reserved = getReservedQuantity(product.id)
              const availableStock = product.stock - reserved
              const stockMeta = getStockLabel(availableStock)
              const quantity = quantities[product.id] ?? 1

              return (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Typography fontWeight={700}>{product.name}</Typography>
                  </TableCell>
                
                  <TableCell>{product.category}</TableCell>
                  <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                  <TableCell align="center">
                    <Stack spacing={1} alignItems="center">
                      <Typography variant="body2">{availableStock}</Typography>
                      <Chip
                        label={stockMeta.label}
                        color={stockMeta.color}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 112 }}>
                    <TextField
                      type="number"
                      value={quantity}
                      inputProps={{ min: 1, max: Math.max(availableStock, 1) }}
                      size="small"
                      disabled={availableStock === 0}
                      onChange={(event) =>
                        onAddToCart(product, Number(event.target.value || 1), true)
                      }
                      sx={{ width: 84 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddShoppingCartRoundedIcon />}
                      disabled={availableStock === 0}
                      onClick={() => onAddToCart(product, quantity)}
                    >
                      Agregar
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}

            {loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    Cargando inventario desde el backend...
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    No se encontraron productos con ese criterio de busqueda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
