import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded'
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { formatCurrency } from '../utils/currency'

export default function CartSummary({
  cart,
  subtotal,
  tax,
  total,
  cliente,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  return (
  <Paper sx={{ p: 3, height: '100%' }}>
    
    {/* ENCABEZADO */}
    <Box display="flex" justifyContent="space-between" mb={2}>
      <Typography fontWeight={700}>
        FECHA: {new Date().toLocaleDateString()}
      </Typography>
      <Typography fontWeight={700}>
        FAC. N°: 001
      </Typography>
    </Box>

    {/* CLIENTE */}
    <Box mb={2}>
      <Typography><strong>CLIENTE:</strong> {cliente || "Consumidor Final"}</Typography>
    </Box>

    <Divider sx={{ mb: 2 }} />

    {/* TABLA TIPO FACTURA */}
    {cart.length === 0 ? (
      <Typography color="text.secondary">
        No hay productos en el carrito
      </Typography>
    ) : (
      <List disablePadding sx={{ mb: 2 }}>
        {cart.map((item) => (
          <ListItem
            key={item.id}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              py: 1
            }}
          >
            <Box width="100%" display="flex" justifyContent="space-between">
              
              {/* IZQUIERDA */}
              <Box>
                <Typography fontWeight={600}>
                  {item.quantity} x {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(item.price)}
                </Typography>
              </Box>

              {/* DERECHA */}
              <Typography fontWeight={700}>
                {formatCurrency(item.quantity * item.price)}
              </Typography>

            </Box>
          </ListItem>
        ))}
      </List>
    )}

    <Divider sx={{ my: 2 }} />

    {/* TOTALES */}
    <Box display="flex" justifyContent="flex-end">
      <Box minWidth={200}>
        <Typography display="flex" justifyContent="space-between">
          <span>SUBTOTAL:</span>
          {formatCurrency(subtotal)}
        </Typography>

        <Typography display="flex" justifyContent="space-between">
          <span>ISV (15%):</span>
          {formatCurrency(tax)}
        </Typography>

        <Typography
          display="flex"
          justifyContent="space-between"
          fontWeight={700}
        >
          <span>TOTAL:</span>
          {formatCurrency(total)}
        </Typography>
      </Box>
    </Box>

  </Paper>
)
}
