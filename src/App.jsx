import { useState, useEffect, useCallback } from 'react';
import styles from './App.module.css';
import StepIndicator from './components/StepIndicator';
import WizardNav from './components/WizardNav';
import Step1Welcome from './components/steps/Step1Welcome';
import Step2Culture from './components/steps/Step2Culture';
import Step3Calling from './components/steps/Step3Calling';
import Step4Attributes from './components/steps/Step4Attributes';
import Step5Skills from './components/steps/Step5Skills';
import Step6Virtues from './components/steps/Step6Virtues';
import Step7Features from './components/steps/Step7Features';
import Step8Equipment from './components/steps/Step8Equipment';
import Step9Identity from './components/steps/Step9Identity';
import Step10Review from './components/steps/Step10Review';
import { createDefaultCharacter } from './utils/defaultCharacter';
import { saveToLocalStorage, loadFromLocalStorage, decodeCharacterFromHash } from './utils/urlState';
import { saveCharacterToRoster } from './utils/rosterStorage';
import cultures from './data/cultures.json';
import callings from './data/callings.json';

const TOTAL_STEPS = 10;

function validateStep(step, character) {
  switch (step) {
    case 1: return { valid: true };
    case 2: return {
      valid: !!character.cultureId,
      msg: 'Please select a Heroic Culture.',
    };
    case 3: {
      const calling = callings.find(c => c.id === character.callingId);
      const callingChosen = !!character.callingId;
      const favOk = calling
        ? (character.callingFavouredSkills || []).length >= calling.favouredSkillCount
        : false;
      return {
        valid: callingChosen && favOk,
        msg: !callingChosen
          ? 'Please select a Calling.'
          : 'Please choose your Calling favoured skills.',
      };
    }
    case 4: {
      const attrs = character.attributes;
      return {
        valid: attrs.strength != null && attrs.heart != null && attrs.wits != null,
        msg: 'Please select an attribute set.',
      };
    }
    case 5: {
      const skillTotal = Object.values(character.additionalSkills || {}).reduce((s, v) => s + v, 0);
      const combatTotal = Object.values(character.additionalCombat || {}).reduce((s, v) => s + v, 0);
      return {
        valid: skillTotal <= 20 && combatTotal <= 3,
        msg: skillTotal > 20
          ? 'Skill points exceed maximum (20).'
          : combatTotal > 3
          ? 'Combat points exceed maximum (3).'
          : '',
      };
    }
    case 6: return { valid: true };
    case 7: {
      return {
        valid: (character.distinctiveFeatures || []).length === 2,
        msg: 'Please select exactly 2 Distinctive Features.',
      };
    }
    case 8: return { valid: true };
    case 9: {
      return {
        valid: !!(character.identity?.name),
        msg: 'Please enter a character name.',
      };
    }
    case 10: return { valid: true };
    default: return { valid: true };
  }
}

// Initialise combat base values when culture/calling changes
function computeCombatBase(character) {
  const culture = cultures.find(c => c.id === character.cultureId);
  if (!culture) return {};
  const base = { axes: 0, bows: 0, spears: 0, swords: 0, knives: 0 };
  const combatProf = culture.combatProficiencies;
  if (combatProf?.fixed) {
    combatProf.fixed.forEach(f => {
      // If there's an OR, we don't pre-select; otherwise set fixed skill
      if (!f.or) {
        base[f.skill] = f.rank;
      }
    });
  }
  return base;
}

export default function App({ onNavigateToRoster, characterToLoad, onCharacterLoaded }) {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [character, setCharacter] = useState(createDefaultCharacter());
  const [hasSaved, setHasSaved] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load a character from the roster when Router passes one in
  useEffect(() => {
    if (characterToLoad) {
      setCharacter(characterToLoad);
      setStep(characterToLoad.wizardStep || 10);
      setCompletedSteps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      setShowRestorePrompt(false);
      if (onCharacterLoaded) onCharacterLoaded();
    }
  }, [characterToLoad, onCharacterLoaded]);

  // Check for URL hash or local storage on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#char=')) {
      const decoded = decodeCharacterFromHash(hash.slice(6));
      if (decoded) {
        setCharacter(decoded);
        setStep(10);
        setCompletedSteps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        return;
      }
    }
    const saved = loadFromLocalStorage();
    if (saved) {
      setHasSaved(true);
      setShowRestorePrompt(true);
    }
  }, []);

  // Auto-save on every character change
  useEffect(() => {
    if (step > 1) {
      saveToLocalStorage(character);
    }
  }, [character, step]);

  const updateCharacter = useCallback((updates) => {
    if (typeof updates === 'function') {
      setCharacter(prev => ({ ...prev, ...updates(prev) }));
    } else {
      setCharacter(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const handleNext = () => {
    const { valid, msg } = validateStep(step, character);
    if (!valid) return;
    setCompletedSteps(prev => [...new Set([...prev, step])]);
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      setIsPlaying(false);
    }
  };

  const handleNavigate = (targetStep) => {
    setStep(targetStep);
    if (targetStep !== 10) setIsPlaying(false);
  };

  const handleStart = () => {
    setStep(2);
    setCompletedSteps([1]);
  };

  const handleSaveToRoster = useCallback(() => {
    const id = saveCharacterToRoster({ ...character, wizardStep: step });
    // Write the rosterId back into state so subsequent auto-saves update the same entry
    setCharacter(prev => ({ ...prev, _rosterId: id }));
    return id;
  }, [character, step]);

  const handleRestore = () => {
    const saved = loadFromLocalStorage();
    if (saved) {
      setCharacter(saved);
      setStep(saved.wizardStep || 2);
      setShowRestorePrompt(false);
    }
  };

  const handleLoadFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const loaded = JSON.parse(ev.target.result);
        setCharacter(loaded);
        setStep(10);
        setCompletedSteps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      } catch {
        alert('Invalid character file.');
      }
    };
    reader.readAsText(file);
  };

  // Keep combat base in sync with culture
  useEffect(() => {
    if (character.cultureId) {
      const base = computeCombatBase(character);
      setCharacter(prev => ({ ...prev, _combatBase: base }));
    }
  }, [character.cultureId]);

  const validation = validateStep(step, character);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1Welcome
            onStart={handleStart}
            hasSavedChar={hasSaved && showRestorePrompt}
            onRestore={handleRestore}
            onLoadFile={handleLoadFile}
            onViewRoster={onNavigateToRoster}
          />
        );
      case 2:
        return <Step2Culture character={character} onChange={updateCharacter} />;
      case 3:
        return <Step3Calling character={character} onChange={updateCharacter} />;
      case 4:
        return <Step4Attributes character={character} onChange={updateCharacter} />;
      case 5:
        return <Step5Skills character={character} onChange={updateCharacter} />;
      case 6:
        return <Step6Virtues character={character} onChange={updateCharacter} />;
      case 7:
        return <Step7Features character={character} onChange={updateCharacter} />;
      case 8:
        return <Step8Equipment character={character} onChange={updateCharacter} />;
      case 9:
        return <Step9Identity character={character} onChange={updateCharacter} />;
      case 10:
        return <Step10Review character={character} onSaveToRoster={handleSaveToRoster} onViewRoster={onNavigateToRoster} onChange={updateCharacter} isPlaying={isPlaying} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.topBar}>
        <a href="#" className={styles.appTitle} onClick={e => { e.preventDefault(); handleNavigate(1); }}>The One Ring Character Builder · 2E Freedom Rules</a>
        <div className={styles.topBarRight}>
          <button
            type="button"
            className={`${styles.btnPlay} ${isPlaying ? styles.btnPlaying : ''}`}
            onClick={() => {
              if (!isPlaying) {
                handleNavigate(10);
                setIsPlaying(true);
              } else {
                setIsPlaying(false);
              }
            }}
            disabled={!completedSteps.includes(9)}
            title={!completedSteps.includes(9) ? 'Complete character creation to enter Play mode' : isPlaying ? 'Pause — return to editing' : 'Enter Play mode'}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      {step > 1 && !isPlaying && (
        <StepIndicator
          currentStep={step}
          completedSteps={completedSteps}
          onNavigate={handleNavigate}
        />
      )}

      <div className={styles.content}>
        {renderStep()}
      </div>

      {step > 1 && !isPlaying && (
        <WizardNav
          step={step}
          totalSteps={TOTAL_STEPS}
          onPrev={handlePrev}
          onNext={handleNext}
          nextDisabled={!validation.valid}
          validationMsg={!validation.valid ? validation.msg : ''}
          nextLabel={step === TOTAL_STEPS ? null : undefined}
        />
      )}
    </div>
  );
}
