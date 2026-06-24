import { Navbar } from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { AppContent } from './AppContent';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <div className="app">
          <Navbar />
          <AppContent />
        </div>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
