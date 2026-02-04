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
import { Folder } from '../types';

const FoldersManager: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('FoldersManager must be used within AppProvider');
  }
  const { folders, addFolder, deleteFolder, tasks } = context;
  const { dialogState, showDialog, hideDialog, handleConfirm } = useConfirmDialog();
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      showDialog({
        title: 'Error',
        message: 'Please enter a folder name',
        showCancel: false,
      });
      return;
    }

    addFolder({ name: newFolderName.trim() });
    setNewFolderName('');
    setIsAdding(false);
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    const folderTasks = tasks.filter((task) => task.folderId === folderId);
    if (folderTasks.length > 0) {
      showDialog({
        title: 'Cannot Delete',
        message: `This folder has ${folderTasks.length} task(s). Please reassign or delete the tasks first.`,
        showCancel: false,
      });
      return;
    }

    showDialog({
      title: 'Delete Folder',
      message: `Are you sure you want to delete "${folderName}"?`,
      confirmText: 'Delete',
      onConfirm: () => deleteFolder(folderId),
    });
  };

  const getFolderTaskCount = (folderId: string): number => {
    return tasks.filter((task) => task.folderId === folderId).length;
  };

  const renderFolder = ({ item }: { item: Folder }) => {
    const taskCount = getFolderTaskCount(item.id);

    return (
      <View style={styles.folderItem}>
        <View style={styles.folderContent}>
          <MaterialIcons name="folder" size={24} color="#f39c12" />
          <View style={styles.folderInfo}>
            <Text style={styles.folderName}>{item.name}</Text>
            <Text style={styles.folderTaskCount}>{taskCount} task(s)</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDeleteFolder(item.id, item.name)}>
          <MaterialIcons name="delete" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Folders</Text>
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
            value={newFolderName}
            onChangeText={setNewFolderName}
            placeholder="Folder name"
            placeholderTextColor="#95a5a6"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleAddFolder}>
            <Text style={styles.saveButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}

      {folders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="folder-open" size={64} color="#bdc3c7" />
          <Text style={styles.emptyText}>No folders yet</Text>
          <Text style={styles.emptySubtext}>Tap + to create your first folder</Text>
        </View>
      ) : (
        <FlatList
          data={folders}
          renderItem={renderFolder}
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
  folderItem: {
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
  folderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  folderInfo: {
    marginLeft: 12,
  },
  folderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  folderTaskCount: {
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

export default FoldersManager;
