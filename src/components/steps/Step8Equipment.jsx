import { useState } from 'react';
import styles from './Step8Equipment.module.css';
import equipmentData from '../../data/equipment.json';

export default function Step8Equipment({ character, onChange }) {
  const eq = character.equipment || {};
  const [newWeapon, setNewWeapon] = useState({ name: '', damage: '', injury: '', load: 0, notes: '' });
  const [showAddWeapon, setShowAddWeapon] = useState(false);

  const armourId = eq.armourId || 'none';
  const helmId = eq.helmId || 'none';
  const shieldId = eq.shieldId || 'none';
  const weapons = eq.weapons || [];

  const totalLoad = (eq.armourLoad || 0) + (eq.helmLoad || 0) + (eq.shieldLoad || 0) +
    weapons.reduce((s, w) => s + (Number(w.load) || 0), 0);

  const handleArmour = (id) => {
    const armour = equipmentData.armour.find(a => a.id === id);
    onChange({ equipment: { ...eq, armourId: id, armourLoad: armour?.load || 0, armourRating: armour?.rating || 0 } });
  };

  const handleHelm = (id) => {
    const helm = equipmentData.helms.find(h => h.id === id);
    onChange({ equipment: { ...eq, helmId: id, helmLoad: helm?.load || 0, helmRating: helm?.rating || 0 } });
  };

  const handleShield = (id) => {
    const shield = equipmentData.shields.find(s => s.id === id);
    onChange({ equipment: { ...eq, shieldId: id, shieldLoad: shield?.load || 0, shieldParryBonus: shield?.parryBonus || 0 } });
  };

  const handleAddPresetWeapon = (weapon) => {
    onChange({ equipment: { ...eq, weapons: [...weapons, { ...weapon }] } });
  };

  const handleAddCustomWeapon = () => {
    if (!newWeapon.name) return;
    onChange({ equipment: { ...eq, weapons: [...weapons, { ...newWeapon, load: Number(newWeapon.load) || 0 }] } });
    setNewWeapon({ name: '', damage: '', injury: '', load: 0, notes: '' });
    setShowAddWeapon(false);
  };

  const handleRemoveWeapon = (idx) => {
    onChange({ equipment: { ...eq, weapons: weapons.filter((_, i) => i !== idx) } });
  };

  const totalArmour = (eq.armourRating || 0) + (eq.helmRating || 0);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Equipment</h2>
      <p className={styles.intro}>
        Select your armour, helm, and shield. Add weapons from the list or create custom entries.
        Your <strong>Load</strong> total determines when you become Weary.
      </p>

      <div className={styles.loadBar}>
        <span className={styles.loadLabel}>Total Load</span>
        <span className={styles.loadVal}>{totalLoad}</span>
        <span className={styles.loadNote}>Armour Rating: {totalArmour}{shieldId !== 'none' ? ` + Parry +${eq.shieldParryBonus || 0}` : ''}</span>
      </div>

      <div className={styles.sections}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Armour</div>
          <select
            className={styles.select}
            value={armourId}
            onChange={e => handleArmour(e.target.value)}
          >
            {equipmentData.armour.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} (Rating {a.rating}, Load {a.load})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Helm</div>
          <select
            className={styles.select}
            value={helmId}
            onChange={e => handleHelm(e.target.value)}
          >
            {equipmentData.helms.map(h => (
              <option key={h.id} value={h.id}>
                {h.name} (Rating {h.rating}, Load {h.load})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Shield</div>
          <select
            className={styles.select}
            value={shieldId}
            onChange={e => handleShield(e.target.value)}
          >
            {equipmentData.shields.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} (Parry +{s.parryBonus}, Load {s.load})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.weaponsSection}>
        <div className={styles.weaponsSectionHeader}>
          <div className={styles.sectionTitle}>Weapons</div>
          <button type="button" className={styles.btnAdd} onClick={() => setShowAddWeapon(!showAddWeapon)}>
            + Add Weapon
          </button>
        </div>

        {showAddWeapon && (
          <div className={styles.addWeapon}>
            <div className={styles.addWeaponTitle}>Add Preset Weapon:</div>
            <div className={styles.presetList}>
              {equipmentData.weapons.map(w => (
                <button
                  key={w.id}
                  type="button"
                  className={styles.presetBtn}
                  onClick={() => { handleAddPresetWeapon(w); setShowAddWeapon(false); }}
                >
                  {w.name}
                </button>
              ))}
            </div>
            <div className={styles.addWeaponTitle} style={{ marginTop: 12 }}>Or enter custom:</div>
            <div className={styles.customForm}>
              <input
                placeholder="Name" value={newWeapon.name}
                onChange={e => setNewWeapon({ ...newWeapon, name: e.target.value })}
                className={styles.input}
              />
              <input
                placeholder="Damage" value={newWeapon.damage}
                onChange={e => setNewWeapon({ ...newWeapon, damage: e.target.value })}
                className={styles.input}
              />
              <input
                placeholder="Injury" value={newWeapon.injury}
                onChange={e => setNewWeapon({ ...newWeapon, injury: e.target.value })}
                className={styles.input}
              />
              <input
                placeholder="Load" type="number" value={newWeapon.load}
                onChange={e => setNewWeapon({ ...newWeapon, load: e.target.value })}
                className={styles.input}
              />
              <input
                placeholder="Notes" value={newWeapon.notes}
                onChange={e => setNewWeapon({ ...newWeapon, notes: e.target.value })}
                className={styles.input}
              />
              <button type="button" className={styles.btnConfirm} onClick={handleAddCustomWeapon}>
                Add
              </button>
            </div>
          </div>
        )}

        {weapons.length === 0 ? (
          <div className={styles.noWeapons}>No weapons added yet. Click "Add Weapon" above.</div>
        ) : (
          <div className={styles.weaponList}>
            {weapons.map((w, idx) => (
              <div key={idx} className={styles.weaponRow}>
                <span className={styles.weaponName}>{w.name}</span>
                <span className={styles.weaponStat}>Dmg: {w.damage || '—'}</span>
                <span className={styles.weaponStat}>Inj: {w.injury || '—'}</span>
                <span className={styles.weaponStat}>Load: {w.load || 0}</span>
                {w.notes && <span className={styles.weaponNotes}>{w.notes}</span>}
                <button
                  type="button"
                  className={styles.btnRemove}
                  onClick={() => handleRemoveWeapon(idx)}
                  aria-label={`Remove ${w.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
