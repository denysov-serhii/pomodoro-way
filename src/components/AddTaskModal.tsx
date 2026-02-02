import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../contexts/AppContext';
import ConfirmDialog from './common/ConfirmDialog';
import { useConfirmDialog } from '../hooks/useConfirmDialog';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ visible, onClose }) => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('AddTaskModal must be used within AppProvider');
  }
  const { addTask, projects, tags } = context;
  const { dialogState, showDialog, hideDialog, handleConfirm } = useConfirmDialog();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSave = () => {
    if (!title.trim()) {
      showDialog({
        title: 'Error',
        message: 'Please enter a task title',
        showCancel: false,
      });
      return;
    }

    addTask({
      title: title.trim(),
      description: description.trim(),
      projectId: selectedProject,
      tags: selectedTags,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setSelectedProject(null);
    setSelectedTags([]);
    onClose();
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Task</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#2c3e50" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter task title"
                placeholderTextColor="#95a5a6"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter task description"
                placeholderTextColor="#95a5a6"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Project</Text>
              {projects.length === 0 ? (
                <Text style={styles.emptyMessage}>No projects available</Text>
              ) : (
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      selectedProject === null && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedProject(null)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedProject === null && styles.optionTextSelected,
                      ]}
                    >
                      No Project
                    </Text>
                  </TouchableOpacity>
                  {projects.map((project) => (
                    <TouchableOpacity
                      key={project.id}
                      style={[
                        styles.optionButton,
                        selectedProject === project.id && styles.optionButtonSelected,
                      ]}
                      onPress={() => setSelectedProject(project.id)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedProject === project.id && styles.optionTextSelected,
                        ]}
                      >
                        {project.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags</Text>
              {tags.length === 0 ? (
                <Text style={styles.emptyMessage}>No tags available</Text>
              ) : (
                <View style={styles.optionsContainer}>
                  {tags.map((tag) => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.optionButton,
                        selectedTags.includes(tag.id) && styles.optionButtonSelected,
                      ]}
                      onPress={() => toggleTag(tag.id)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedTags.includes(tag.id) && styles.optionTextSelected,
                        ]}
                      >
                        #{tag.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ConfirmDialog
        visible={dialogState.visible}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        showCancel={dialogState.showCancel}
        onConfirm={handleConfirm}
        onCancel={hideDialog}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    marginRight: 10,
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: '#3498db',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  optionTextSelected: {
    color: '#fff',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#27ae60',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AddTaskModal;
