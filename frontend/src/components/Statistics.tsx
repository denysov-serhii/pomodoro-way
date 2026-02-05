import React, { useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../contexts/AppContext';
import { Task, Project, Tag, PomodoroSession } from '../types';

interface TaskWithMinutes extends Task {
  minutes: number;
}

interface ProjectWithStats extends Project {
  taskCount: number;
  pomodoros: number;
  minutes: number;
}

interface TagWithStats extends Tag {
  taskCount: number;
  pomodoros: number;
  minutes: number;
}

type TimePeriod = 'day' | 'week' | 'month' | 'year' | 'all';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const Statistics: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Statistics must be used within AppProvider');
  }
  const { tasks, projects, tags, pomodoroSessions } = context;

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('all');

  // Filter pomodoro sessions based on selected time period
  const filteredSessions = useMemo(() => {
    if (selectedPeriod === 'all') {
      return pomodoroSessions;
    }

    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'day':
        // Today - from midnight
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        // Last 7 days
        startDate = new Date(now.getTime() - 7 * MILLISECONDS_PER_DAY);
        break;
      case 'month':
        // Last 30 days
        startDate = new Date(now.getTime() - 30 * MILLISECONDS_PER_DAY);
        break;
      case 'year':
        // Last 365 days
        startDate = new Date(now.getTime() - 365 * MILLISECONDS_PER_DAY);
        break;
      default:
        return pomodoroSessions;
    }

    return pomodoroSessions.filter(session => {
      const sessionDate = new Date(session.completedAt);
      return sessionDate >= startDate;
    });
  }, [pomodoroSessions, selectedPeriod]);

  // Get tasks that have sessions in the selected period
  const filteredTasks = useMemo(() => {
    if (selectedPeriod === 'all') {
      return tasks;
    }

    // Get unique task IDs from filtered sessions
    const taskIdsWithSessions = new Set(filteredSessions.map(s => s.taskId));
    return tasks.filter(task => taskIdsWithSessions.has(task.id));
  }, [tasks, filteredSessions, selectedPeriod]);

  // Filter tasks created in the period
  const tasksCreatedInPeriod = useMemo(() => {
    if (selectedPeriod === 'all') {
      return tasks;
    }

    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * MILLISECONDS_PER_DAY);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * MILLISECONDS_PER_DAY);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * MILLISECONDS_PER_DAY);
        break;
      default:
        return tasks;
    }

    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate;
    });
  }, [tasks, selectedPeriod]);

  // Filter tasks completed in the period
  const tasksCompletedInPeriod = useMemo(() => {
    if (selectedPeriod === 'all') {
      return tasks.filter(task => task.isCompleted);
    }

    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * MILLISECONDS_PER_DAY);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * MILLISECONDS_PER_DAY);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * MILLISECONDS_PER_DAY);
        break;
      default:
        return tasks.filter(task => task.isCompleted);
    }

    return tasks.filter(task => {
      if (!task.isCompleted || !task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= startDate;
    });
  }, [tasks, selectedPeriod]);

  // Calculate total statistics
  const stats = useMemo(() => {
    const totalPomodoros = filteredSessions.length;
    const totalMinutes = filteredSessions.reduce((sum, session) => sum + session.durationMinutes, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    // Count unique projects and tags that have tasks with sessions in the selected period
    const uniqueProjectIds = new Set(filteredTasks.filter(t => t.projectId).map(t => t.projectId));
    const uniqueTagIds = new Set(filteredTasks.flatMap(t => t.tags || []));

    return {
      totalPomodoros,
      totalHours,
      remainingMinutes,
      totalTasks: filteredTasks.length,
      totalProjects: uniqueProjectIds.size,
      totalTags: uniqueTagIds.size,
      tasksCreated: tasksCreatedInPeriod.length,
      tasksCompleted: tasksCompletedInPeriod.length,
    };
  }, [filteredSessions, filteredTasks, tasksCreatedInPeriod, tasksCompletedInPeriod]);

  // Calculate task statistics
  const taskStats = useMemo((): TaskWithMinutes[] => {
    return filteredTasks
      .map(task => {
        // Calculate pomodoros and minutes from sessions in the selected period
        const taskSessions = filteredSessions.filter(s => s.taskId === task.id);
        const pomodoros = taskSessions.length;
        const minutes = taskSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
        
        return {
          ...task,
          completedPomodoros: pomodoros,
          minutes,
        };
      })
      .sort((a, b) => b.completedPomodoros - a.completedPomodoros);
  }, [filteredTasks, filteredSessions]);

  // Calculate project statistics
  const projectStats = useMemo((): ProjectWithStats[] => {
    return projects.map(project => {
      const projectTasks = filteredTasks.filter(task => task.projectId === project.id);
      const projectTaskIds = new Set(projectTasks.map(t => t.id));
      const projectSessions = filteredSessions.filter(s => projectTaskIds.has(s.taskId));
      const pomodoros = projectSessions.length;
      const minutes = projectSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      return {
        ...project,
        taskCount: projectTasks.length,
        pomodoros,
        minutes,
      };
    }).sort((a, b) => b.pomodoros - a.pomodoros);
  }, [projects, filteredTasks, filteredSessions]);

  // Calculate tag statistics
  const tagStats = useMemo((): TagWithStats[] => {
    return tags.map(tag => {
      const tagTasks = filteredTasks.filter(task => task.tags && task.tags.includes(tag.id));
      const tagTaskIds = new Set(tagTasks.map(t => t.id));
      const tagSessions = filteredSessions.filter(s => tagTaskIds.has(s.taskId));
      const pomodoros = tagSessions.length;
      const minutes = tagSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      return {
        ...tag,
        taskCount: tagTasks.length,
        pomodoros,
        minutes,
      };
    }).sort((a, b) => b.pomodoros - a.pomodoros);
  }, [tags, filteredTasks, filteredSessions]);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderTaskItem = ({ item }: { item: TaskWithMinutes }) => (
    <View style={styles.statItem}>
      <View style={styles.statItemContent}>
        <Text style={styles.statItemTitle}>{item.title}</Text>
        <Text style={styles.statItemSubtitle}>
          {item.completedPomodoros || 0} pomodoros • {formatTime(item.minutes)}
        </Text>
      </View>
      <MaterialIcons name="timer" size={20} color="#e74c3c" />
    </View>
  );

  const renderProjectItem = ({ item }: { item: ProjectWithStats }) => (
    <View style={styles.statItem}>
      <View style={styles.statItemContent}>
        <Text style={styles.statItemTitle}>{item.name}</Text>
        <Text style={styles.statItemSubtitle}>
          {item.taskCount} task(s) • {item.pomodoros} pomodoros • {formatTime(item.minutes)}
        </Text>
      </View>
      <MaterialIcons name="folder" size={20} color="#3498db" />
    </View>
  );

  const renderTagItem = ({ item }: { item: TagWithStats }) => (
    <View style={styles.statItem}>
      <View style={styles.statItemContent}>
        <Text style={styles.statItemTitle}>#{item.name}</Text>
        <Text style={styles.statItemSubtitle}>
          {item.taskCount} task(s) • {item.pomodoros} pomodoros • {formatTime(item.minutes)}
        </Text>
      </View>
      <MaterialIcons name="label" size={20} color="#8e44ad" />
    </View>
  );

  const renderPeriodButton = (period: TimePeriod, label: string) => (
    <TouchableOpacity
      key={period}
      style={[
        styles.periodButton,
        selectedPeriod === period && styles.periodButtonActive,
      ]}
      onPress={() => setSelectedPeriod(period)}
    >
      <Text
        style={[
          styles.periodButtonText,
          selectedPeriod === period && styles.periodButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Time Period Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Time Period</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.periodScrollView}
        >
          <View style={styles.periodButtons}>
            {renderPeriodButton('day', 'Today')}
            {renderPeriodButton('week', 'Week')}
            {renderPeriodButton('month', 'Month')}
            {renderPeriodButton('year', 'Year')}
            {renderPeriodButton('all', 'All Time')}
          </View>
        </ScrollView>
      </View>

      {/* Overall Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Statistics</Text>
        <View style={styles.overallGrid}>
          <View style={styles.overallCard}>
            <MaterialIcons name="timer" size={32} color="#e74c3c" />
            <Text style={styles.overallValue}>{stats.totalPomodoros}</Text>
            <Text style={styles.overallLabel}>Pomodoros</Text>
          </View>
          <View style={styles.overallCard}>
            <MaterialIcons name="access-time" size={32} color="#27ae60" />
            <Text style={styles.overallValue}>
              {stats.totalHours}h {stats.remainingMinutes}m
            </Text>
            <Text style={styles.overallLabel}>Total Time</Text>
          </View>
          <View style={styles.overallCard}>
            <MaterialIcons name="add-task" size={32} color="#3498db" />
            <Text style={styles.overallValue}>{stats.tasksCreated}</Text>
            <Text style={styles.overallLabel}>Tasks Created</Text>
          </View>
          <View style={styles.overallCard}>
            <MaterialIcons name="check-circle" size={32} color="#2ecc71" />
            <Text style={styles.overallValue}>{stats.tasksCompleted}</Text>
            <Text style={styles.overallLabel}>Tasks Completed</Text>
          </View>
        </View>
      </View>

      {/* Tasks Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        {taskStats.length === 0 ? (
          <Text style={styles.emptyText}>No tasks yet</Text>
        ) : (
          <FlatList
            data={taskStats}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Projects Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projects</Text>
        {projectStats.length === 0 ? (
          <Text style={styles.emptyText}>No projects yet</Text>
        ) : (
          <FlatList
            data={projectStats}
            renderItem={renderProjectItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Tags Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tags</Text>
        {tagStats.length === 0 ? (
          <Text style={styles.emptyText}>No tags yet</Text>
        ) : (
          <FlatList
            data={tagStats}
            renderItem={renderTagItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterSection: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  periodScrollView: {
    marginHorizontal: -5,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 5,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  periodButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  overallGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overallCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  overallValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
  },
  overallLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  statItemContent: {
    flex: 1,
  },
  statItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statItemSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default Statistics;
