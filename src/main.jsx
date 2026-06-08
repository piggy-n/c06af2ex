import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './global.less';
import IndexPage from './pages';
import TargetNum from './pages/TargetNum';

// 应用路由：保留原有的 / 和 /num 页面入口。
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/num" element={<TargetNum />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.render(<AppRouter />, document.getElementById('root'));
