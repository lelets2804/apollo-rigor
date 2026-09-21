import App from './App';
import Site from './site/Site';

// Divisão por caminho: /sistema* → ERP interno; qualquer outro → vitrine do cliente.
// O Vite serve index.html para as duas rotas (SPA fallback), então basta olhar o pathname.
export default function Root() {
  const interno = window.location.pathname.replace(/\/+$/, '').startsWith('/sistema');
  return interno ? <App /> : <Site />;
}
