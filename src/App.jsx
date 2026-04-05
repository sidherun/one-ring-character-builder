import { useState, useEffect, useCallback } from 'react';
import styles from './App.module.css';
import StepIndicator from './components/StepIndicator';
import WizardNav from './components/WizardNav';
import NotesPanel from './components/NotesPanel';
import Toast from './components/Toast';
import { usePlayMode } from './hooks/usePlayMode';
import { useNotesPanel } from './hooks/useNotesPanel';
import { useToast } from './hooks/useToast';
import { useAutoSave } from './hooks/useAutoSave';
import { useCharacterManagement } from './hooks/useCharacterManagement';
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
import { clearLocalStorage } from './utils/urlState';
import { saveCharacterToRoster, saveVersion } from './utils/rosterStorage';
import { validateStep } from './utils/validation';

const TOTAL_STEPS = 10;

export default function App({ onNavigateToRoster, characterToLoad, onCharacterLoaded }) {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [character, setCharacter] = useState(createDefaultCharacter());
  const [hasSaved, setHasSaved] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const { isPlaying, enterPlayMode, exitPlayMode, resetPlayModeOnNavigation } = usePlayMode();
  const { isNotesOpen, toggleNotes, closeNotes } = useNotesPanel();
  const { toast, showToast, hideToast } = useToast();

  // Auto-save character to localStorage and roster
  useAutoSave(character, step, showToast);

  // Character loading and management
  const { handleStart, handleRestore, handleLoadFile } = useCharacterManagement({
    character,
    setCharacter,
    setStep,
    setCompletedSteps,
    setShowRestorePrompt,
    setHasSaved,
    characterToLoad,
    onCharacterLoaded,
  });

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
      exitPlayMode();
      closeNotes();
    }
  };

  const handleNavigate = (targetStep) => {
    setStep(targetStep);
    resetPlayModeOnNavigation(targetStep);
    if (targetStep !== 10) {
      closeNotes();
    }
  };

  const handleSaveToRoster = useCallback(() => {
    const charToSave = { ...character, wizardStep: step };
    const result = saveCharacterToRoster(charToSave);

    if (!result.success) {
      showToast(result.error, 'error', 0); // Persistent error
      return null;
    }

    const versionResult = saveVersion(result.id, charToSave);
    if (!versionResult.success) {
      showToast(versionResult.error, 'warning', 8000);
    }

    // Write the rosterId back into state so subsequent auto-saves update the same entry
    setCharacter(prev => ({ ...prev, _rosterId: result.id }));
    return result.id;
  }, [character, step, showToast]);

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
          {isPlaying && (
            <button
              type="button"
              className={`${styles.btnNotes} ${isNotesOpen ? styles.btnNotesOpen : ''}`}
              onClick={toggleNotes}
              title={isNotesOpen ? 'Close notes panel' : 'Open notes panel'}
            >
              ✎ Notes
            </button>
          )}
          <button
            type="button"
            className={`${styles.btnPlay} ${isPlaying ? styles.btnPlaying : ''}`}
            onClick={() => {
              if (!isPlaying) {
                handleNavigate(10);
                enterPlayMode();
              } else {
                exitPlayMode();
                closeNotes();
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

      <div className={`${styles.content} ${isNotesOpen ? styles.contentShifted : ''}`}>
        {renderStep()}
      </div>

      {isPlaying && isNotesOpen && (
        <NotesPanel
          notes={character._notes || []}
          onChange={notes => updateCharacter({ _notes: notes })}
          onClose={closeNotes}
        />
      )}

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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
