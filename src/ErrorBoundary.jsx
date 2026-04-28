import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: '',
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Se produjo un error inesperado.',
    }
  }

  componentDidCatch(error) {
    console.error('Error renderizando la app:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f4f7f5',
            padding: '24px',
            fontFamily: 'Segoe UI, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 16px 40px rgba(11, 31, 29, 0.12)',
              padding: '24px',
            }}
          >
            <h1 style={{ marginTop: 0, color: '#0b1f1d' }}>La app encontro un error</h1>
            <p style={{ color: '#334155', lineHeight: 1.5 }}>
              Se abrio la APK, pero el frontend se detuvo antes de mostrarse por completo.
            </p>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                color: '#b91c1c',
                marginBottom: 0,
              }}
            >
              {this.state.errorMessage}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
