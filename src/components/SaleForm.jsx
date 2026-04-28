import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { formatCurrency } from '../utils/currency'

const paymentMethods = ['Efectivo', 'Tarjeta', 'Transferencia']

export default function SaleForm({
  form,
  errors = {},
  cart = [],
  total = 0,
  saleCode,
  mode = 'checkout',
  onChange,
  onBack,
  onContinue,
  onSubmit,
  isSubmitting = false,
}) {
  if (mode === 'customer') {
    return (
      <Paper sx={{ p: { xs: 3, md: 4 }, maxWidth: 640, mx: 'auto' }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Datos del cliente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Primero registra a quien se le realizara la venta y luego podras agregar
              productos.
            </Typography>
          </Box>

          <Alert severity="info">Folio en preparacion: {saleCode}</Alert>

          <TextField
            label="Cliente"
            value={form.customer}
            onChange={(event) => onChange('customer', event.target.value)}
            error={Boolean(errors.customer)}
            helperText={errors.customer || 'Este dato se mostrara durante toda la venta.'}
            fullWidth
            autoFocus
          />

          <TextField
            label="Identidad o RTN"
            value={form.document}
            onChange={(event) => onChange('document', event.target.value)}
            error={Boolean(errors.document)}
            helperText={errors.document || 'Opcional por ahora, puedes completarlo despues.'}
            fullWidth
          />

          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={onContinue}
            disabled={isSubmitting}
          >
            Continuar a productos
          </Button>
        </Stack>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h6">Finalizar venta</Typography>
          <Typography variant="body2" color="text.secondary">
            Revisa al cliente, completa los datos restantes y confirma la transaccion.
          </Typography>
        </Box>

        <Alert severity="info" sx={{ display: { xs: 'none', md: 'flex' } }}>
          Folio: {saleCode}
        </Alert>
      </Stack>

      <Stack spacing={2.5}>
        <TextField
          label="Cliente"
          value={form.customer}
          onChange={(event) => onChange('customer', event.target.value)}
          error={Boolean(errors.customer)}
          helperText={errors.customer}
          fullWidth
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Identidad o RTN"
            value={form.document}
            onChange={(event) => onChange('document', event.target.value)}
            error={Boolean(errors.document)}
            helperText={errors.document}
            fullWidth
          />

          <TextField
            select
            label="Metodo de pago"
            value={form.paymentMethod}
            onChange={(event) => onChange('paymentMethod', event.target.value)}
            error={Boolean(errors.paymentMethod)}
            helperText={errors.paymentMethod}
            fullWidth
          >
            {paymentMethods.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <TextField
          label="Notas"
          value={form.notes}
          onChange={(event) => onChange('notes', event.target.value)}
          placeholder="Ejemplo: cliente solicita entrega en mostrador"
          multiline
          minRows={3}
          fullWidth
        />

        <Box
          sx={{
            borderRadius: 4,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            p: 2.5,
          }}
        >
          <Typography variant="overline" sx={{ opacity: 0.9 }}>
            Resumen de la venta
          </Typography>
          <Typography variant="h5">{formatCurrency(total)}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {cart.length} producto(s) listos para facturar.
          </Typography>
        </Box>

        <Button
          variant="text"
          color="inherit"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={onBack}
          disabled={isSubmitting}
          sx={{ alignSelf: 'flex-start' }}
        >
          Cambiar cliente
        </Button>

        <Button
          variant="contained"
          size="large"
          startIcon={<AssignmentTurnedInRoundedIcon />}
          onClick={onSubmit}
          disabled={cart.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'Registrando venta...' : 'Registrar venta'}
        </Button>
      </Stack>
    </Paper>
  )
}
