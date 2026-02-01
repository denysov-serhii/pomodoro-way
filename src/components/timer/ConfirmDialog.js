import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { timerStyles as styles } from '../../styles/timerStyles';

const ConfirmDialog = ({ visible, title, message, onConfirm, onCancel }) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
    >
      <View style={styles.confirmOverlay}>
        <View style={styles.confirmDialog}>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmMessage}>{message}</Text>
          <View style={styles.confirmButtons}>
            {onConfirm && onCancel && (
              <TouchableOpacity
                style={styles.confirmButtonCancel}
                onPress={onCancel}
              >
                <Text style={styles.confirmButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.confirmButtonOk}
              onPress={() => {
                if (onConfirm) {
                  onConfirm();
                } else {
                  onCancel();
                }
              }}
            >
              <Text style={styles.confirmButtonOkText}>
                {onConfirm && onCancel ? 'Finish' : 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmDialog;
