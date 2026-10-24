// import NamePlateManager from './components/NamePlateManager';

// function App() {
//   return (
//     <div>
//       <NamePlateManager />
//     </div>
//   );
// }

// export default App;






import React, { useState, useEffect } from 'react';
import Login from './Login';
import NamePlateManager from './components/NamePlateManager';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // App load hote hi local storage session check karna (F5 Refresh Guard)
  useEffect(() => {
    const authStatus = localStorage.getItem('esl_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Kya aap logout karna chahte hain?');
    if (!confirmLogout) return;

    localStorage.removeItem('esl_auth');
    setIsAuthenticated(false);
  };

  // Jab tak storage check ho raha hai, tab tak smooth blank/loader
  if (checkingAuth) {
    return null;
  }

  return (
    <>
      {!isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <NamePlateManager onLogout={handleLogout} />
      )}
    </>
  );
}