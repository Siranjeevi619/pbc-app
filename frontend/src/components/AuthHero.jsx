export default function AuthHero({ eyebrow, title, lead, points }) {
  return (
    <div className="auth-hero">
      <div className="auth-hero-content">
        <div className="auth-hero-eyebrow">{eyebrow}</div>
        <h1 className="auth-hero-title">{title}</h1>
        <p className="auth-hero-lead">{lead}</p>
        <ul className="auth-hero-points">
          {points.map(p => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
