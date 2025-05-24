import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PaperDetailsPage from './pages/PaperDetailsPage';
import AnalysisPage from './pages/AnalysisPage';
import RecentPapersPage from './pages/RecentPapersPage';
import HypothesisPage from './pages/HypothesisPage';
import { ThemeContext } from './pages/HomePage';
import './App.css';

function App() {
  // Theme state: 'light' or 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Apply theme class to html element and persist
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme handler
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={theme}>
      <Router>
        <Layout theme={theme} toggleTheme={toggleTheme}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/paper/:id" element={<PaperDetailsPage />} />
            <Route path="/recent" element={<RecentPapersPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/hypothesis" element={<HypothesisPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;
