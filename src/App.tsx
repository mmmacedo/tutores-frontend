import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminPage } from './admin/AdminPage';
import { EmbedPage } from './embed/EmbedPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/embed/:tutorId" element={<EmbedPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
