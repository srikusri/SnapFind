import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

// Placeholder components for routes we haven't built yet
import CreateBox from './pages/CreateBox';
import BoxDetails from './pages/BoxDetails';
import Search from './pages/Search';
import Settings from './pages/Settings';
import EditBox from './pages/EditBox';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateBox />} />
          <Route path="/box/:id" element={<BoxDetails />} />
          <Route path="/edit/:id" element={<EditBox />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
