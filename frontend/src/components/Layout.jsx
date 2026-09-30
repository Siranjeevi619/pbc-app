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
        <div className="brand"><span className="brand-mark">P</span><span>PBC <em>Request Register</em></span></div>
        <nav className="tabbar">
          {tabs.map(t => (
            <NavLink key={t.to} to={t.to} className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>
              {t.label}
            </NavLink>
          ))}
          {engagementId && <NavLink to="/engagements" className="tab">All Engagements</NavLink>}
        </nav>
        <div className="userbar">
          <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <span className="user-name">{user?.name}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
