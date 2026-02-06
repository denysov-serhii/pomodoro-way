import { StyleSheet } from 'react-native';

export const timerStyles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  sessionBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },
  sessionBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  pomodoroCounter: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 15,
  },
  pomodoroCounterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
  },
  taskInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  currentTaskLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  currentTaskText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  pomodoroCount: {
    fontSize: 16,
    color: '#e74c3c',
    marginTop: 8,
    fontWeight: '500',
  },
  noTaskText: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  startButton: {
    backgroundColor: '#27ae60',
  },
  finishButton: {
    backgroundColor: '#3498db',
  },
  skipButton: {
    backgroundColor: '#f39c12',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  durationContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  durationOptionsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 350,
  },
  durationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#ecf0f1',
    margin: 4,
  },
  durationButtonSelected: {
    backgroundColor: '#3498db',
  },
  durationButtonDisabled: {
    opacity: 0.5,
  },
  durationButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
  },
  durationButtonTextSelected: {
    color: '#fff',
  },
  taskSelectorButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    minWidth: 280,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearTaskButton: {
    marginLeft: 10,
    padding: 4,
  },
  noTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  emptyTasksContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTasksText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#95a5a6',
    marginTop: 15,
  },
  emptyTasksSubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
  taskOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  taskOptionSelected: {
    backgroundColor: '#ebf5fb',
  },
  taskOptionContent: {
    flex: 1,
  },
  taskOptionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  taskOptionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  taskOptionPomodoros: {
    fontSize: 12,
    color: '#e74c3c',
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  clearSelectionButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
  },
  clearSelectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  folderHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
    marginLeft: 8,
    flex: 1,
  },
  folderTaskCount: {
    fontSize: 12,
    color: '#7f8c8d',
    marginRight: 8,
  },
  expandIcon: {
    marginLeft: 'auto',
  },
  starIcon: {
    marginRight: 6,
  },
});
