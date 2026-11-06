import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { bwSheet, dayOverrideSheet, startFlow } from '../sheets.jsx'
import { openFrayFitPrograms } from '../components/FrayFitPrograms.jsx'
import FrayFitMomentum from '../components/FrayFitMomentum.jsx'
import { frayfitHome } from '../lib/frayfit-home.js'
import { exerciseNameText, fmtNum, isoOf } from '../lib/format.js'
import { EXIDX } from '../lib/exercises.js'
import { lastBW, workoutDay, doneUnits, setUnitsTotal } from '../lib/history.js'
import Icon from '../components/Icon.jsx'
import { Button } from '../components/ui.jsx'

const dateLabel = (iso, options = { day: 'numeric', month: 'long' }) => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', options)

function SessionPreview({ S, next, nav }) {
  const active = S.active
  const routines = next?.routines || []
  const entries = active ? active.entries || [] : routines.flatMap(r => r.ex || [])
  const name = active ? active.name : routines.map(r => r.name).join(' + ')
  const editing = !!active?.editingWorkoutId
  const onStart = () => active ? nav('/workout') : startFlow(routines.map(r => r.id))
  const exerciseName = entry => {
    const custom = S.customEx?.find(ex => ex.id === entry.id)
    return custom ? custom.n : EXIDX[entry.id] ? exerciseNameText(EXIDX[entry.id]) : entry.name || 'Exercice indisponible'
  }
  return <section className="frayfit-panel frayfit-next" aria-labelledby="frayfit-next-title">
    <h2 id="frayfit-next-title">{active ? editing ? 'Séance en modification' : 'Ta séance en cours' : 'Ta prochaine séance'}</h2>
    {active || next ? <>
      <div className="frayfit-session-heading">
        <div><h3>{name}</h3><p>{next && !active ? dateLabel(next.iso, { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' : ''}{entries.length} exercice{entries.length > 1 ? 's' : ''}</p></div>
        <Button variant="primary" trailingIcon="chevronRight" onClick={onStart}>{active ? editing ? 'Continuer la modification' : 'Reprendre la séance' : 'Commencer la séance'}</Button>
      </div>
      <ul className="frayfit-exercise-list">{entries.slice(0, 4).map((entry, i) => <li key={i}>
        <span>{exerciseName(entry)}</span>
        <span>{Array.isArray(entry.sets) ? `${entry.sets.reduce((n, s) => n + doneUnits(s), 0)} / ${setUnitsTotal([entry])} séries` : Number.isFinite(entry.sets) ? `${entry.sets} séries` : 'À configurer'}</span>
      </li>)}</ul>
      {entries.length > 4 && <p className="frayfit-more">+ {entries.length - 4} autre{entries.length > 5 ? 's' : ''} exercice{entries.length > 5 ? 's' : ''}</p>}
    </> : <div className="frayfit-welcome">
      <h3>{S.routines.length ? 'À toi de choisir le rythme.' : 'Ta première séance commence ici.'}</h3>
      <p>{S.routines.length ? 'Choisis une séance ou organise tes prochains entraînements.' : 'Pars d’un programme existant ou compose le tien avec tes exercices.'}</p>
      <div className="frayfit-actions"><Button variant="primary" trailingIcon="chevronRight" onClick={S.routines.length ? () => nav('/workout') : openFrayFitPrograms}>{S.routines.length ? 'Choisir une séance' : 'Choisir un programme'}</Button><Button variant="ghost" onClick={() => nav('/plan')}>{S.routines.length ? 'Organiser ma semaine' : 'Créer mon programme'}</Button></div>
    </div>}
  </section>
}

export default function FrayFitHome() {
  const nav = useNavigate()
  const S = useStore(s => s.S)
  // A dashboard left open overnight follows the local day, without writing to the profile.
  const [today, setToday] = useState(() => isoOf(new Date()))
  useEffect(() => {
    const refresh = () => setToday(isoOf(new Date()))
    const interval = setInterval(refresh, 60000)
    window.addEventListener('focus', refresh)
    return () => { clearInterval(interval); window.removeEventListener('focus', refresh) }
  }, [])
  const { days, next, week, latest } = frayfitHome(S, new Date(today + 'T12:00:00'))
  const weight = lastBW(S)

  return <main className="frayfit-home" lang="fr">
    <div className="frayfit-mobile-brand"><span><Icon name="dumbbell" />FrayFit</span><Button variant="ghost" size="sm" onClick={() => nav('/settings')} aria-label="Mon compte"><Icon name="person" /></Button></div>
    <header className="frayfit-home-header">
      <div><h1>Ton entraînement, à ton rythme.</h1><p>Tes programmes, tes séances et ta progression, au même endroit.</p></div>
      <div className="frayfit-header-actions"><Button variant="primary" onClick={openFrayFitPrograms}>Programmes guidés</Button><Button className="frayfit-outline" onClick={() => nav('/workout')}>{S.active ? 'Ouvrir ma séance' : 'Nouvelle séance'}</Button></div>
    </header>

    <div className="frayfit-dashboard">
      <SessionPreview S={S} next={next} nav={nav} />
      <section className="frayfit-panel frayfit-week" aria-labelledby="frayfit-week-title">
        <h2 id="frayfit-week-title">Cette semaine</h2>
        <p className="frayfit-week-range">{dateLabel(days[0].iso)} au {dateLabel(days[6].iso)}</p>
        <div className="frayfit-week-days">{days.map(day => <button key={day.iso} className={(day.today ? 'is-today ' : '') + (day.done ? 'is-done' : '')} aria-current={day.today ? 'date' : undefined} aria-label={`${dateLabel(day.iso, { weekday: 'long', day: 'numeric', month: 'long' })}${day.done ? ', séance terminée' : day.planned ? ', séance prévue' : ', repos'}`} onClick={() => dayOverrideSheet(day.iso)}>
          <span>{day.date.toLocaleDateString('fr-FR', { weekday: 'narrow' })}</span><strong>{day.date.getDate()}</strong><i className={day.done ? 'done' : day.planned ? 'planned' : ''} aria-hidden="true" />
        </button>)}</div>
        <dl className="frayfit-week-metrics"><div><dt>Séances</dt><dd>{week.sessions}</dd></div><div><dt>Séries</dt><dd>{week.sets}</dd></div><div><dt>Volume</dt><dd>{fmtNum(week.volume)} <small>{S.unit}</small></dd></div></dl>
      </section>

      <section className="frayfit-panel frayfit-programs" aria-labelledby="frayfit-programs-title">
        <div className="frayfit-section-heading"><h2 id="frayfit-programs-title">Tes programmes</h2><Link to="/plan">Tout voir <Icon name="chevronRight" /></Link></div>
        {S.routines.length ? <div className="frayfit-routines">{S.routines.slice(0, 3).map(routine => <Link to={'/plan/r/' + routine.id} key={routine.id}>
          <span><h3>{routine.name}</h3><p>{routine.ex?.length || 0} exercice{routine.ex?.length > 1 ? 's' : ''}</p></span><span className="frayfit-routine-arrow"><Icon name="chevronRight" /></span>
        </Link>)}</div> : <div className="frayfit-programs-empty"><Icon name="clipboard" /><p>Un programme qui te ressemble.</p><Button variant="ghost" trailingIcon="chevronRight" onClick={() => nav('/plan')}>Composer mon programme</Button></div>}
      </section>

      <section className="frayfit-panel frayfit-progress" aria-labelledby="frayfit-progress-title">
        <h2 id="frayfit-progress-title">Ta progression</h2>
        {latest ? <div className="frayfit-progress-content"><div className="frayfit-progress-total">{S.workouts.length}<span>séance{S.workouts.length > 1 ? 's' : ''} enregistrée{S.workouts.length > 1 ? 's' : ''}</span></div><p>Dernière séance : <strong>{latest.name || 'Entraînement'}</strong>{workoutDay(latest) ? ' · ' + dateLabel(workoutDay(latest)) : ''}</p><Link to="/stats">Voir ma progression <Icon name="chevronRight" /></Link></div> : <div className="frayfit-progress-content"><span className="frayfit-progress-icon"><Icon name="chart" /></span><p>Ta première séance lance ton historique.</p><Link to="/library">Explorer les exercices <Icon name="chevronRight" /></Link></div>}
        {S.showWeightCard !== false && <div className="frayfit-weight"><span>{weight ? `${fmtNum(weight.w)} ${S.unit} · ${dateLabel(weight.d)}` : 'Suis aussi ton poids au fil du temps.'}</span><Button size="sm" variant="ghost" onClick={() => bwSheet()}>{weight ? 'Actualiser mon poids' : 'Enregistrer mon poids'}</Button></div>}
      </section>
    </div>
    <FrayFitMomentum S={S} today={today} />
    <footer className="frayfit-home-footer"><Link to="/home/details">Vue détaillée <Icon name="chevronRight" /></Link><a href="https://franckraymond.tech/">Retour au portfolio</a><a href="frayfit-credits.html">Crédits et licences</a></footer>
  </main>
}
