import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../contexts/AppContext';
import ConfirmDialog from './common/ConfirmDialog';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { Project } from '../types';

const ProjectsManager: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('ProjectsManager must be used within AppProvider');
  }
  const { projects, addProject, deleteProject, tasks } = context;
  const { dialogState, showDialog, hideDialog, handleConfirm } = useConfirmDialog();
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const handleAddProject = () => {
    if (!newProjectName.trim()) {
      showDialog({
        title: 'Error',
        message: 'Please enter a project name',
        showCancel: false,
      });
      return;
    }

    addProject({ name: newProjectName.trim() });
    setNewProjectName('');
    setIsAdding(false);
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    const projectTasks = tasks.filter((task) => task.projectId === projectId);
    if (projectTasks.length > 0) {
      showDialog({
        title: 'Cannot Delete',
        message: `This project has ${projectTasks.length} task(s). Please reassign or delete the tasks first.`,
        showCancel: false,
      });
      return;
    }

    showDialog({
      title: 'Delete Project',
      message: `Are you sure you want to delete "${projectName}"?`,
      confirmText: 'Delete',
      onConfirm: () => deleteProject(projectId),
    });
  };

  const getProjectTaskCount = (projectId: string): number => {
    return tasks.filter((task) => task.projectId === projectId).length;
  };

  const renderProject = ({ item }: { item: Project }) => {
    const taskCount = getProjectTaskCount(item.id);

    return (
      <View style={styles.projectItem}>
        <View style={styles.projectContent}>
          <MaterialIcons name="folder" size={24} color="#3498db" />
          <View style={styles.projectInfo}>
            <Text style={styles.projectName}>{item.name}</Text>
            <Text style={styles.projectTaskCount}>{taskCount} task(s)</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDeleteProject(item.id, item.name)}>
          <MaterialIcons name="delete" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Projects</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAdding(!isAdding)}
        >
          <MaterialIcons name={isAdding ? 'close' : 'add'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {isAdding && (
        <View style={styles.addContainer}>
          <TextInput
            style={styles.input}
            value={newProjectName}
            onChangeText={setNewProjectName}
            placeholder="Project name"
            placeholderTextColor="#95a5a6"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleAddProject}>
            <Text style={styles.saveButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}

      {projects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="folder-open" size={64} color="#bdc3c7" />
          <Text style={styles.emptyText}>No projects yet</Text>
          <Text style={styles.emptySubtext}>Tap + to create your first project</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
      <ConfirmDialog
        visible={dialogState.visible}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        showCancel={dialogState.showCancel}
        onConfirm={handleConfirm}
        onCancel={hideDialog}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#fff',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  projectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  projectInfo: {
    marginLeft: 12,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  projectTaskCount: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#95a5a6',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
});

export default ProjectsManager;
