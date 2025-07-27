import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import MagicLogin from './components/MagicLogin';

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/magic-login" element={<MagicLogin />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}
