import { useState, useCallback } from 'react';
import { ConfirmDialogState } from '../types';

interface ShowDialogConfig {
  title?: string;
  message?: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: true,
  });

  const showDialog = useCallback((config: ShowDialogConfig) => {
    setDialogState({
      visible: true,
      title: config.title || '',
      message: config.message || '',
      onConfirm: config.onConfirm || (() => {}),
      confirmText: config.confirmText || 'OK',
      cancelText: config.cancelText || 'Cancel',
      showCancel: config.showCancel !== false,
    });
  }, []);

  const hideDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, visible: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
    hideDialog();
  }, [dialogState.onConfirm, hideDialog]);

  return {
    dialogState,
    showDialog,
    hideDialog,
    handleConfirm,
  };
};
