import { useState, useCallback } from 'react';

export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: true,
  });

  const showDialog = useCallback((config) => {
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
