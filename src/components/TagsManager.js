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

const TagsManager = () => {
  const { tags, addTag, deleteTag, tasks } = useContext(AppContext);
  const { dialogState, showDialog, hideDialog, handleConfirm } = useConfirmDialog();
  const [newTagName, setNewTagName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTag = () => {
    if (!newTagName.trim()) {
      showDialog({
        title: 'Error',
        message: 'Please enter a tag name',
        showCancel: false,
      });
      return;
    }

    addTag({ name: newTagName.trim() });
    setNewTagName('');
    setIsAdding(false);
  };

  const handleDeleteTag = (tagId, tagName) => {
    const tagTasks = tasks.filter((task) => task.tags && task.tags.includes(tagId));
    if (tagTasks.length > 0) {
      showDialog({
        title: 'Cannot Delete',
        message: `This tag is used in ${tagTasks.length} task(s). Please remove it from tasks first.`,
        showCancel: false,
      });
      return;
    }

    showDialog({
      title: 'Delete Tag',
      message: `Are you sure you want to delete "#${tagName}"?`,
      confirmText: 'Delete',
      onConfirm: () => deleteTag(tagId),
    });
  };

  const getTagTaskCount = (tagId) => {
    return tasks.filter((task) => task.tags && task.tags.includes(tagId)).length;
  };

  const renderTag = ({ item }) => {
    const taskCount = getTagTaskCount(item.id);

    return (
      <View style={styles.tagItem}>
        <View style={styles.tagContent}>
          <MaterialIcons name="label" size={24} color="#8e44ad" />
          <View style={styles.tagInfo}>
            <Text style={styles.tagName}>#{item.name}</Text>
            <Text style={styles.tagTaskCount}>{taskCount} task(s)</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDeleteTag(item.id, item.name)}>
          <MaterialIcons name="delete" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tags</Text>
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
            value={newTagName}
            onChangeText={setNewTagName}
            placeholder="Tag name"
            placeholderTextColor="#95a5a6"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleAddTag}>
            <Text style={styles.saveButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}

      {tags.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="label-outline" size={64} color="#bdc3c7" />
          <Text style={styles.emptyText}>No tags yet</Text>
          <Text style={styles.emptySubtext}>Tap + to create your first tag</Text>
        </View>
      ) : (
        <FlatList
          data={tags}
          renderItem={renderTag}
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
        onConfirm={() => handleConfirm(dialogState.onConfirm)}
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
    backgroundColor: '#8e44ad',
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
  tagItem: {
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
  tagContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tagInfo: {
    marginLeft: 12,
  },
  tagName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  tagTaskCount: {
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

export default TagsManager;
