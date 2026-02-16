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
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      showDialog({
        title: 'Error',
        message: 'Please enter a folder name',
        showCancel: false,
      });
      return;
    }

    addFolder({ 
      name: newFolderName.trim(),
      parentFolderId: selectedParentId,
    });
    setNewFolderName('');
    setIsAdding(false);
    setSelectedParentId(null);
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    showDialog({
      title: 'Delete Folder',
      message: `Are you sure you want to delete "${folderName}"? Tasks in this folder will be moved to no folder. Child folders will be moved to the parent folder.`,
      confirmText: 'Delete',
      onConfirm: () => deleteFolder(folderId),
    });
  };

  const handleAddSubFolder = (parentId: string) => {
    setSelectedParentId(parentId);
    setIsAdding(true);
  };

  const getFolderTaskCount = (folderId: string, recursive: boolean = false): number => {
    let count = tasks.filter((task) => task.folderId === folderId).length;
    
    if (recursive) {
      const childFolders = folders.filter(f => f.parentFolderId === folderId);
      childFolders.forEach(childFolder => {
        count += getFolderTaskCount(childFolder.id, true);
      });
    }
    
    return count;
  };

  // Build hierarchy of folders
  const buildFolderHierarchy = (): (Folder & { level: number })[] => {
    const rootFolders = folders.filter(f => !f.parentFolderId);
    
    const buildTree = (parentId: string | null, level: number = 0): (Folder & { level: number })[] => {
      const childFolders = folders.filter(f => f.parentFolderId === parentId);
      return childFolders.flatMap(folder => [
        { ...folder, level },
        ...buildTree(folder.id, level + 1)
      ]);
    };
    
    return rootFolders.flatMap(folder => [
      { ...folder, level: 0 },
      ...buildTree(folder.id, 1)
    ]);
  };

  const hierarchicalFolders = buildFolderHierarchy();

  const renderFolder = ({ item }: { item: Folder & { level: number } }) => {
    const taskCount = getFolderTaskCount(item.id, false);
    const totalTaskCount = getFolderTaskCount(item.id, true);
    const indentWidth = item.level * 20;

    return (
      <View style={[styles.folderItem, { marginLeft: indentWidth }]}>
        <View style={styles.folderContent}>
          <MaterialIcons name="folder" size={24} color="#f39c12" />
          <View style={styles.folderInfo}>
            <Text style={styles.folderName}>{item.name}</Text>
            <Text style={styles.folderTaskCount}>
              {taskCount} task(s){totalTaskCount > taskCount ? ` (${totalTaskCount} total)` : ''}
            </Text>
          </View>
        </View>
        <View style={styles.folderActions}>
          <TouchableOpacity 
            onPress={() => handleAddSubFolder(item.id)}
            style={styles.actionButton}
          >
            <MaterialIcons name="create-new-folder" size={22} color="#3498db" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteFolder(item.id, item.name)}>
            <MaterialIcons name="delete" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
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
            placeholder={selectedParentId ? "Sub-folder name" : "Folder name"}
            placeholderTextColor="#95a5a6"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleAddFolder}>
            <Text style={styles.saveButtonText}>Add</Text>
          </TouchableOpacity>
          {selectedParentId && (
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => {
                setIsAdding(false);
                setSelectedParentId(null);
                setNewFolderName('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
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
          data={hierarchicalFolders}
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
  cancelButton: {
    backgroundColor: '#95a5a6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    marginLeft: 10,
  },
  cancelButtonText: {
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
  folderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    padding: 4,
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
