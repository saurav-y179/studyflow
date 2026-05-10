import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppWithVideo from './App.jsx'
import AppV1 from './AppV1.jsx'
import AppV3 from './v3/AppV3.jsx'

function MainApp() {
  const [version, setVersion] = useState(() => {
    return localStorage.getItem('app_version') || 'v3';
  });

  const handleVersionChange = (newVersion) => {
    localStorage.setItem('app_version', newVersion);
    setVersion(newVersion);
  };

  return version === 'v3'
    ? <AppV3 currentVersion={version} onSwitchVersion={handleVersionChange} />
    : version === 'app' 
    ? <AppWithVideo currentVersion={version} onSwitchVersion={handleVersionChange} />
    : <AppV1 currentVersion={version} onSwitchVersion={handleVersionChange} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainApp />
  </StrictMode>,
)
