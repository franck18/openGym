import { NavLink, Link } from 'react-router-dom'
import Icon from './Icon.jsx'

const destinations = [
  ['/home', 'grid', 'Vue d’ensemble'],
  ['/plan', 'clipboard', 'Programmes'],
  ['/library', 'dumbbell', 'Exercices'],
  ['/history', 'calendar', 'Historique'],
  ['/stats', 'chart', 'Progression'],
]

export default function FrayFitSidebar() {
  return <aside className="frayfit-sidebar" lang="fr" aria-label="Navigation FrayFit">
    <Link className="frayfit-brand" to="/home"><Icon name="dumbbell" /><span>FrayFit</span></Link>
    <nav aria-label="Navigation principale">
      {destinations.map(([to, icon, label]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'is-active' : undefined}>
        <Icon name={icon} /><span>{label}</span>
      </NavLink>)}
    </nav>
    <div className="frayfit-sidebar-footer">
      <a href="https://franckraymond.tech/"><Icon name="expand" /><span>Retour au portfolio</span></a>
      <Link to="/settings"><Icon name="person" /><span>Mon compte</span></Link>
      <div className="frayfit-source-links"><a href="frayfit-credits.html">Crédits</a><a href="https://github.com/franck18/openGym/tree/codex/frayfit-personal" target="_blank" rel="noopener noreferrer">Code source</a></div>
      <p>Version personnelle · Franck Raymond</p>
    </div>
  </aside>
}
