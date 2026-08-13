import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, message: (err && err.message) || 'Erro desconhecido' };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: 380, textAlign: 'center' }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>Algo deu errado ao carregar o app</p>
            <p style={{ fontSize: 13, color: '#726D62' }}>{this.state.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
