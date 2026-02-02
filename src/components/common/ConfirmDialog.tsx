import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  visible, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'OK', 
  cancelText = 'Cancel', 
  showCancel = true 
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            {showCancel && onCancel && (
              <TouchableOpacity
                style={styles.buttonCancel}
                onPress={onCancel}
              >
                <Text style={styles.buttonCancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.buttonOk}
              onPress={onConfirm}
            >
              <Text style={styles.buttonOkText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonCancel: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
    marginRight: 10,
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  buttonOk: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3498db',
  },
  buttonOkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ConfirmDialog;
