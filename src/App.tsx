import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Shell from './components/layout/Shell';
import DashboardPage from './pages/DashboardPage';
import InvoiceListPage from './pages/InvoiceListPage';
import InvoiceNewPage from './pages/InvoiceNewPage';
import InvoiceEditPage from './pages/InvoiceEditPage';
import InvoiceViewPage from './pages/InvoiceViewPage';
import ClientListPage from './pages/ClientListPage';
import ClientNewPage from './pages/ClientNewPage';
import ClientEditPage from './pages/ClientEditPage';
import SettingsPage from './pages/SettingsPage';
import SharePage from './pages/SharePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/share/:encoded" element={<SharePage />} />
        <Route element={<Shell />}>
          <Route index element={<DashboardPage />} />
          <Route path="invoices" element={<InvoiceListPage />} />
          <Route path="invoices/new" element={<InvoiceNewPage />} />
          <Route path="invoices/:id" element={<InvoiceViewPage />} />
          <Route path="invoices/:id/edit" element={<InvoiceEditPage />} />
          <Route path="clients" element={<ClientListPage />} />
          <Route path="clients/new" element={<ClientNewPage />} />
          <Route path="clients/:id/edit" element={<ClientEditPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
