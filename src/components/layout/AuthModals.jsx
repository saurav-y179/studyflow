import { AnimatePresence } from 'framer-motion';
import { RegistrationModal } from '../RegistrationModal';
import { SettingsModal } from '../SettingsModal';

export const AuthModals = ({ user, isSettingsOpen, onRegister, onSaveSettings, onCloseSettings }) => {
  return (
    <AnimatePresence>
      {!user && <RegistrationModal key="register" onRegister={onRegister} />}
      {user && isSettingsOpen && (
        <SettingsModal
          key="settings"
          user={user}
          onSave={onSaveSettings}
          onClose={onCloseSettings}
        />
      )}
    </AnimatePresence>
  );
};
