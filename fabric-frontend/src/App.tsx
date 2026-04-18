import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VerifyProduct from './pages/VerifyProduct';
import QRVerifyPage from './pages/QRVerifyPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VerifyProduct />} />
        <Route path="/verify/:productId" element={<QRVerifyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;