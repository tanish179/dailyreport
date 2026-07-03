import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AiAssistant from '../ai/AiAssistant';

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <Header />
        <main style={{
          flex: 1,
          padding: '1.5rem 2rem',
          overflowY: 'auto',
        }}>
          <Outlet />
        </main>
      </div>
      <AiAssistant />
    </div>
  );
}
