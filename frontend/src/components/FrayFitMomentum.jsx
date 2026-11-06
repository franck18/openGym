import { useMemo } from 'react'
import { frayfitMomentum } from '../lib/frayfit-momentum.js'
import { calendarSheet, workoutDetailSheet } from '../sheets.jsx'
import Icon from './Icon.jsx'
import { Button } from './ui.jsx'
import '../frayfit-momentum.css'

const date = iso => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export default function FrayFitMomentum({ S, today }) {
  const m = useMemo(() => frayfitMomentum(S, new Date(today + 'T12:00:00')), [S.workouts, S.weekStart, today])
  const minutes = Math.floor(m.current.durationMs / 60000)
  const duration = !m.current.timedSessions ? '—' : minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`
  const comparison = m.previous.sessions === 0
    ? m.current.sessions === 0 ? 'Ton point de départ' : 'Tes premières séances prennent forme'
    : `${m.change > 0 ? '+' : ''}${m.change} séance${Math.abs(m.change) === 1 ? '' : 's'} par rapport aux 28 jours précédents`
  return <section className="frayfit-panel ff-momentum" aria-labelledby="ff-momentum-title" lang="fr">
    <div className="ff-momentum-heading"><div><h2 id="ff-momentum-title">Ton élan, jour après jour.</h2><p>Les 28 derniers jours, à partir de tes séances enregistrées.</p></div><Button variant="ghost" trailingIcon="chevronRight" onClick={() => calendarSheet(today)}>Ouvrir le calendrier</Button></div>
    <dl className="ff-momentum-metrics">
      <div><dt>Séances</dt><dd>{m.current.sessions}</dd><span>{comparison}</span></div>
      <div><dt>Jours actifs</dt><dd>{m.activeDays}<small> / 28</small></dd><span>À ton rythme, sans série à préserver.</span></div>
      <div><dt>Séries réalisées</dt><dd>{m.current.sets}</dd><span>Chaque côté compte dans les exercices unilatéraux.</span></div>
      <div><dt>Durée renseignée</dt><dd className="ff-duration">{duration}</dd><span>Les imports sans durée sont exclus.</span></div>
    </dl>
    <div className="ff-activity-heading"><h3>12 semaines d’entraînement</h3><span>Une case, une journée</span></div>
    <div className="ff-activity-scroll" role="group" aria-label="Calendrier des 12 dernières semaines. Faire défiler horizontalement si nécessaire.">
      <div className="ff-activity-grid">{m.days.map(day => {
        const n = day.workouts.length, label = `${date(day.iso)} : ${n} séance${n === 1 ? '' : 's'}${day.future ? ', à venir' : ''}`
        return <button key={day.iso} data-day={day.iso} className={`ff-activity-day level-${Math.min(n, 3)}${day.today ? ' is-today' : ''}`} title={label} aria-label={label} aria-current={day.today ? 'date' : undefined} disabled={day.future}
          onClick={() => n === 1 ? workoutDetailSheet(day.workouts[0]) : calendarSheet(day.iso)}><span className="sr-only">{label}</span></button>
      })}</div>
    </div>
    <div className="ff-activity-legend"><span><Icon name="calendar" />Sélectionne un jour pour retrouver tes séances.</span><span>0 <i className="level-0" /><i className="level-1" /><i className="level-2" /><i className="level-3" />3+ séances</span></div>
  </section>
}
