import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { buildStarterPlan, starterPlanDays, starterPlanOptions } from '../lib/starter.js'
import { activeProfile, profileEquipment } from '../lib/equipment.js'
import { EXIDX } from '../lib/exercises.js'
import { exerciseNameText, fmtNum } from '../lib/format.js'
import { useLang } from '../lib/i18n.js'
import { confirmSheet, loadStarterPlan } from '../sheets.jsx'
import Icon from './Icon.jsx'
import { Button } from './ui.jsx'
import '../frayfit-programs.css'

const COPY = {
  ppl: { name: 'Push / Pull / Legs', about: 'Un jour pour pousser, un pour tirer, un pour les jambes.', icon: 'barbell' },
  'upper-lower': { name: 'Haut / Bas du corps', about: 'Deux séances haut du corps et deux séances bas du corps.', icon: 'dumbbell' },
  'full-body': { name: 'Corps entier', about: 'Trois séances distinctes réunissant le haut et le bas du corps.', icon: 'figureStrength' },
  '5x5': { name: '5 × 5', about: 'Trois exercices par séance, cinq séries de cinq répétitions.', icon: 'barbell' },
}
const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const dayList = days => new Intl.ListFormat('fr-FR').format(days.map(day => DAY_NAMES[day]))
const OPTIONS = starterPlanOptions()

export function FrayFitPrograms({ close }) {
  useLang()
  const S = useStore(s => s.S)
  const profiles = S.equipProfiles || []
  const [frequency, setFrequency] = useState(0)
  const [planId, setPlanId] = useState('full-body')
  // Choosing equipment here only changes the preview. The library's saved filter stays put.
  const [profileId, setProfileId] = useState(() => activeProfile(S)?.id || '')
  const profile = profiles.find(p => p.id === profileId) || null
  const options = OPTIONS.filter(option => !frequency || option.days === frequency)
  const preview = useMemo(() => buildStarterPlan(planId, profile ? profileEquipment(profile) : undefined), [planId, profile])
  const sessions = preview?.schedule.map(({ day, routineId }) => {
    const planned = preview.routines.find(r => r.id === routineId)
    // Match the loader's reuse rule: it keeps every setting on an existing routine
    // with the same name and exercise order. Show what will actually be scheduled.
    const existing = planned && S.routines.find(r => r.name === planned.name && r.ex.length === planned.ex.length && r.ex.every((entry, i) => entry.id === planned.ex[i].id))
    return { day, routine: existing || planned, reused: !!existing }
  }).filter(session => session.routine?.ex.length) || []
  const canAdd = sessions.length > 0
  const exerciseCount = sessions.reduce((n, session) => n + session.routine.ex.length, 0)
  const copy = COPY[planId]

  const filter = days => {
    setFrequency(days)
    if (days && !OPTIONS.some(option => option.id === planId && option.days === days)) {
      setPlanId(OPTIONS.find(option => option.days === days).id)
    }
  }

  const add = () => {
    if (!canAdd) return
    // Read the current week at the moment of adding, so an open preview does not hide
    // a routine assigned by another view or by sync in the meantime.
    const current = useStore.getState().S
    const occupied = sessions.map(({ day }) => ({
      day,
      routines: [].concat(current.week?.[day] || []).map(id => current.routines.find(r => r.id === id)).filter(Boolean),
    })).filter(entry => entry.routines.length)
    const apply = () => { close(); loadStarterPlan(planId, profile) }
    if (!occupied.length) { apply(); return }
    confirmSheet({
      title: `Ajouter ${copy.name} ?`,
      message: <div className="ff-program-confirm" lang="fr">
        <p>Jours affectés : <strong>{dayList(sessions.map(session => session.day))}</strong>.</p>
        <p>Jours déjà occupés à réaffecter :</p>
        <ul data-occupied-days>{occupied.map(({ day, routines }) => <li key={day}><strong>{DAY_NAMES[day]}</strong> : {routines.map(r => r.name).join(' + ')}</li>)}</ul>
        <p>Tes routines et ton historique restent conservés.</p>
      </div>,
      confirmText: 'Réaffecter et ajouter', cancelText: 'Garder ma semaine', onConfirm: apply,
    })
  }

  return <section className="ff-program-studio" lang="fr" aria-labelledby="ff-program-title">
    <header className="ff-program-header">
      <div><p className="ff-program-eyebrow">STUDIO DES PROGRAMMES</p><h2 id="ff-program-title">Un programme à ton rythme.</h2><p>Choisis ton rythme, vérifie les séances, puis ajoute-les à ta semaine.</p></div>
      <button type="button" className="ff-program-close" aria-label="Fermer le studio des programmes" onClick={close}><Icon name="xmark" /></button>
    </header>

    <div className="ff-program-controls">
      <fieldset className="ff-program-frequency"><legend>Ton rythme</legend><div>
        {[{ days: 0, label: 'Tous' }, { days: 3, label: '3 jours' }, { days: 4, label: '4 jours' }].map(({ days, label }) => <button type="button" key={days} aria-pressed={frequency === days} onClick={() => filter(days)}>{label}</button>)}
      </div></fieldset>
      <div className="ff-program-equipment"><label htmlFor="ff-program-equipment">Ton matériel</label><select id="ff-program-equipment" value={profile?.id || ''} onChange={event => setProfileId(event.target.value)} aria-describedby={!profiles.length ? 'ff-program-equipment-hint' : undefined}>
        <option value="">Programme d’origine</option>{profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select></div>
    </div>
    {!profiles.length && <p className="ff-program-hint" id="ff-program-equipment-hint">Ajoute un profil de matériel dans les réglages pour adapter les exercices.</p>}

    <div className="ff-program-choices" role="group" aria-label="Choisir un programme">
      {options.map(({ id, days }) => <button type="button" key={id} data-program-id={id} className="ff-program-choice" aria-pressed={planId === id} aria-controls="ff-program-preview" onClick={() => setPlanId(id)}>
        <span className="ff-program-choice-top"><span className="ff-program-glyph"><Icon name={COPY[id].icon} /></span><span>{days} jours / semaine</span><Icon name={planId === id ? 'checkCircle' : 'chevronRight'} /></span>
        <strong>{COPY[id].name}</strong><span className="ff-program-about">{COPY[id].about}</span><span className="ff-program-days">{dayList(starterPlanDays(id))}</span>
      </button>)}
    </div>

    <section className="ff-program-preview" id="ff-program-preview" aria-labelledby="ff-program-preview-title">
      <header className="ff-program-preview-heading"><div><p className="ff-program-eyebrow">LE DÉTAIL AVANT DE CHOISIR</p><h3 id="ff-program-preview-title">{copy.name}</h3></div><p aria-live="polite">{sessions.length} séance{sessions.length > 1 ? 's' : ''} · {exerciseCount} exercices</p></header>
      {profile && preview?.fit && <p className="ff-program-fit" role="status"><Icon name="dumbbell" /><span>Adapté à « {profile.name} » : {preview.fit.swapped} exercice{preview.fit.swapped > 1 ? 's' : ''} remplacé{preview.fit.swapped > 1 ? 's' : ''}, {preview.fit.dropped} retiré{preview.fit.dropped > 1 ? 's' : ''}.</span></p>}
      {canAdd ? <div className="ff-program-sessions">{sessions.map(({ day, routine, reused }) => <article className="ff-program-session" key={day}>
        <header><span>{DAY_NAMES[day]}</span><h4>{routine.name}</h4><small>{routine.ex.length} exercices</small></header>
        {reused && <p className="ff-program-reused"><Icon name="checkCircle" />Tes réglages conservés</p>}
        <ul>{routine.ex.map((entry, index) => <li key={index} data-exercise-id={entry.id}><span>{EXIDX[entry.id] ? exerciseNameText(EXIDX[entry.id]) : 'Exercice indisponible'}</span><span>{entry.sets} séries × {entry.reps} rép.{entry.weight > 0 ? ` · ${fmtNum(entry.weight)} ${S.unit}` : ''}</span></li>)}</ul>
      </article>)}</div> : <div className="ff-program-empty" id="ff-program-empty" role="status"><Icon name="clipboard" /><h4>Aucune séance disponible avec ce matériel</h4><p>Choisis un autre profil ou le programme d’origine pour voir les séances.</p></div>}
    </section>

    <footer className="ff-program-footer"><div>{canAdd && <p><Icon name="calendar" />{dayList(sessions.map(session => session.day))}</p>}<small>Les séances s’ajoutent à tes routines. Tu pourras ensuite les personnaliser.</small></div><Button variant="primary" disabled={!canAdd} aria-describedby={!canAdd ? 'ff-program-empty' : undefined} onClick={add}>Ajouter à ma semaine</Button></footer>
  </section>
}

export const openFrayFitPrograms = () => useUI.getState().openSheet(close => <FrayFitPrograms close={close} />, { wide: true })
