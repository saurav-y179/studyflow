import { StrictMode, useState, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

const AppV3 = lazy(() => import('./v3/AppV3.jsx'))
const AppV1 = lazy(() => import('./AppV1.jsx'))

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#040814' }}>
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#152ad1', borderTopColor: 'transparent' }} />
      <span className="text-sm" style={{ color: '#a1aaed' }}>Loading StudyFlow...</span>
    </div>
  </div>
)

function MainApp() {
  const [version, setVersion] = useState(() => {
    return localStorage.getItem('app_version') || 'v3';
  });

  const handleVersionChange = (newVersion) => {
    localStorage.setItem('app_version', newVersion);
    setVersion(newVersion);
  };

  return (
    <Suspense fallback={<Loading />}>
      {version === 'v3'
        ? <AppV3 currentVersion={version} onSwitchVersion={handleVersionChange} />
        : <AppV1 currentVersion={version} onSwitchVersion={handleVersionChange} />
      }
    </Suspense>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  </StrictMode>,
)
