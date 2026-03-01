import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Analytics from './pages/Analytics';
import Transactions from './pages/Transactions';
import ModelMetrics from './pages/ModelMetrics';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/model" element={<ModelMetrics />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
