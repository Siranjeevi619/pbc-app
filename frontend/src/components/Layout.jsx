import { NavLink, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { engagementId } = useParams();

  const tabs = engagementId
    ? [
        { to: `/engagements/${engagementId}/ledger`, label: 'Firm Ledger' },
        { to: `/engagements/${engagementId}/samples`, label: 'Samples' },
        { to: `/engagements/${engagementId}/automation`, label: 'Automation' },
        { to: `/engagements/${engagementId}/letters`, label: 'Letters' }
      ]
    : [];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">PBC Request Register</div>
        <nav className="tabbar">
          {tabs.map(t => (
            <NavLink key={t.to} to={t.to} className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
              {t.label}
            </NavLink>
          ))}
          {engagementId && <NavLink to="/engagements" className="tab">All Engagements</NavLink>}
        </nav>
        <div className="userbar">
          <span>{user?.name} ({user?.role})</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
