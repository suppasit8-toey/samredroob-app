
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

import Calculator from './pages/Calculator';
// Placeholder components for routes we haven't built yet
import Products from './pages/Products';

const Contact = () => <div style={{ padding: '2rem' }}><h2>Contact Us (Coming Soon)</h2></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="calculator" element={<Calculator />} />
          <Route path="products" element={<Products />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<div style={{ padding: '2rem' }}><h2>About Us</h2></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
