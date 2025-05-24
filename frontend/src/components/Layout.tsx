import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaBook, FaChartLine, FaBars, FaLightbulb } from 'react-icons/fa';
import { FiSun, FiMoon } from 'react-icons/fi';

interface LayoutProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, theme, toggleTheme }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-perplexity-darkbg text-perplexity-darktext' : 'bg-white text-gray-900'}`}>
      {/* Mobile Header */}
      <header className={`lg:hidden flex items-center justify-between px-4 py-3 border-b ${theme === 'dark' ? 'border-perplexity-darkborder bg-perplexity-darkbg' : 'border-gray-200 bg-white'}`}>
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-md transition-colors duration-200 ${theme === 'dark' ? 'hover:bg-perplexity-darkcard text-perplexity-darktext' : 'hover:bg-gray-100 text-gray-800'}`}
          aria-label="Toggle navigation menu"
        >
          <FaBars />
        </button>
        <Link to="/" className={`text-2xl font-bold ${theme === 'dark' ? 'text-perplexity-darkaccent' : 'text-primary'}`}>AcademicAlly</Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-md transition-colors duration-200 ${theme === 'dark' ? 'hover:bg-perplexity-darkcard' : 'hover:bg-gray-100'}`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-gray-700" />}
          </button>
        </div>
      </header>
      
      {/* Sidebar + Main Content Container */}
      <div className="flex h-[calc(100vh-56px)] lg:h-screen">
        {/* Sidebar - Mobile (overlay when open) */}
        <div 
          className={`fixed inset-0 z-40 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:hidden transition-transform duration-300 ease-in-out ${theme === 'dark' ? 'bg-perplexity-darkcard' : 'bg-gray-100'} shadow-xl`}
        >
          <div className="flex flex-col h-full">
            <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-perplexity-darkborder' : 'border-gray-200'}`}>
              <Link to="/" className={`text-2xl font-bold ${theme === 'dark' ? 'text-perplexity-darkaccent' : 'text-primary'}`}>AcademicAlly</Link>
              <button 
                onClick={toggleSidebar}
                className={`p-2 rounded-md transition-colors duration-200 ${theme === 'dark' ? 'hover:bg-perplexity-darkbg text-perplexity-darktext' : 'hover:bg-gray-200 text-gray-800'}`}
                aria-label="Close navigation menu"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            {/* Sidebar Links */}
            <SidebarContent theme={theme} />
          </div>
        </div>
        
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={toggleSidebar}
          ></div>
        )}
        
        {/* Sidebar - Desktop (always visible) */}
        <div className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r ${theme === 'dark' ? 'lg:border-perplexity-darkborder lg:bg-perplexity-darkcard' : 'lg:border-gray-200 lg:bg-gray-100'}`}>
          <div className={`flex items-center justify-between h-14 border-b px-4 ${theme === 'dark' ? 'border-perplexity-darkborder' : 'border-gray-200'}`}>
            <Link to="/" className={`text-2xl font-bold ${theme === 'dark' ? 'text-perplexity-darkaccent' : 'text-primary'}`}>AcademicAlly</Link>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md transition-colors duration-200 ${theme === 'dark' ? 'hover:bg-perplexity-darkbg' : 'hover:bg-gray-200'}`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-gray-700" />}
            </button>
          </div>
          <SidebarContent theme={theme} />
        </div>
        
        {/* Main Content */}
        <main className={`flex-1 lg:ml-64 overflow-y-auto overflow-x-hidden ${theme === 'dark' ? '' : 'bg-gray-50'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

// Extracted sidebar content to reuse in both mobile and desktop views
interface SidebarContentProps {
  theme: 'light' | 'dark';
}

const SidebarContent: React.FC<SidebarContentProps> = ({ theme }) => {
  return (
    <nav className="flex-1 px-2 py-4 overflow-y-auto">
      <ul className="space-y-2">
        <SidebarItem to="/" icon={<FaSearch />} text="Search" theme={theme} />
        <SidebarItem to="/recent" icon={<FaBook />} text="Recent Papers" theme={theme} />
        <SidebarItem to="/analysis" icon={<FaChartLine />} text="Analysis" theme={theme} />
        <SidebarItem to="/hypothesis" icon={<FaLightbulb />} text="Hypothesis" theme={theme} />
      </ul>
      
      <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${theme === 'dark' ? 'border-perplexity-darkborder' : 'border-gray-200'}`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-perplexity-darksecondary' : 'text-gray-500'}`}>
          <p>© 2025 AcademicAlly</p>
        </div>
      </div>
    </nav>
  );
};

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  theme: 'light' | 'dark';
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, text, theme }) => {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
          theme === 'dark' 
            ? 'text-perplexity-darktext hover:bg-perplexity-darkbg' 
            : 'text-gray-700 hover:bg-gray-200'
        }`}
      >
        <span className={`mr-3 ${theme === 'dark' ? 'text-perplexity-darksecondary' : 'text-gray-500'}`}>{icon}</span>
        <span className="font-medium">{text}</span>
      </Link>
    </li>
  );
};

export default Layout; 