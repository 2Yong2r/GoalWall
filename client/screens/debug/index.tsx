import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { syncManager } from '@/services/sync';
import * as GoalDAL from '@/services/database/goals';
import * as TaskDAL from '@/services/database/tasks';
import * as TodoDAL from '@/services/database/todos';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from '@/services/database/index';
import { Screen } from '@/components/Screen';

export default function DebugScreen() {
  const { theme } = useTheme();
  const [localGoals, setLocalGoals] = useState<any[]>([]);
  const [localTasks, setLocalTasks] = useState<any[]>([]);
  const [localTodos, setLocalTodos] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  const loadLocalData = async () => {
    try {
      const goals = await GoalDAL.getAllGoals();
      const tasks = await TaskDAL.getAllTasks();
      const todos = await TodoDAL.getAllTodos();
      setLocalGoals(goals);
      setLocalTasks(tasks);
      setLocalTodos(todos);
      addLog(`Loaded: ${goals.length} goals, ${tasks.length} tasks, ${todos.length} todos`);
    } catch (error) {
      addLog(`Error loading local data: ${error}`);
    }
  };

  const handleManualSync = async () => {
    addLog('Starting manual sync...');
    setSyncStatus(syncManager.getState());

    const unsubscribe = syncManager.subscribe((state) => {
      addLog(`Sync status: ${state.status}`);
      setSyncStatus(state);
    });

    try {
      await syncManager.sync();
      addLog('Sync completed');
      await loadLocalData();
    } catch (error) {
      addLog(`Sync error: ${error}`);
    }

    unsubscribe();
  };

  const clearLogs = () => setLogs([]);

  const handleClearLocalData = async () => {
    Alert.alert(
      '确认清空',
      '这将清空所有本地数据（不会影响云端），是否继续？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认',
          style: 'destructive',
          onPress: async () => {
            try {
              if (Platform.OS === 'web') {
                // Web 环境：清空 AsyncStorage
                const allKeys = await AsyncStorage.getAllKeys();
                const storageKeys = allKeys.filter(key => key.startsWith('@goalwall_db_'));
                if (storageKeys.length > 0) {
                  await AsyncStorage.multiRemove(storageKeys);
                }
                addLog(`Cleared ${storageKeys.length} records from Web storage`);
              } else {
                // 移动环境：使用 SQL DELETE
                const db = await getDatabase();
                await db.execAsync('DELETE FROM goals');
                await db.execAsync('DELETE FROM tasks');
                await db.execAsync('DELETE FROM task_updates');
                await db.execAsync('DELETE FROM todos');
                addLog('Cleared all records from SQLite');
              }
              
              addLog('Local data cleared successfully');
              await loadLocalData();
            } catch (error) {
              addLog(`Error clearing local data: ${error}`);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadLocalData();
    addLog('Debug page loaded');
  }, []);

  return (
    <Screen backgroundColor={theme.backgroundRoot} statusBarStyle="dark">
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>调试页面</Text>

        {/* 同步控制 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>同步控制</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleManualSync}
          >
            <Text style={styles.buttonText}>手动触发同步</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.backgroundDefault }]}
            onPress={loadLocalData}
          >
            <Text style={[styles.buttonText, { color: theme.textPrimary }]}>刷新本地数据</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#EF4444' }]}
            onPress={handleClearLocalData}
          >
            <Text style={styles.buttonText}>清空本地数据</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#9CA3AF' }]}
            onPress={clearLogs}
          >
            <Text style={styles.buttonText}>清空日志</Text>
          </TouchableOpacity>
        </View>

        {/* 同步状态 */}
        {syncStatus && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>同步状态</Text>
            <Text style={[styles.text, { color: theme.textSecondary }]}>
              状态: {syncStatus.status}
            </Text>
            <Text style={[styles.text, { color: theme.textSecondary }]}>
              上次同步: {syncStatus.lastSyncTime || '从未'}
            </Text>
            {syncStatus.errorMessage && (
              <Text style={[styles.text, { color: theme.error }]}>
                错误: {syncStatus.errorMessage}
              </Text>
            )}
          </View>
        )}

        {/* 本地数据统计 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>本地数据统计</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Goals: {localGoals.length}
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Tasks: {localTasks.length}
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Todos: {localTodos.length}
          </Text>
        </View>

        {/* 待同步数据 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>待同步数据</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Goals (pending): {localGoals.filter(g => g.sync_status === 'pending').length}
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Tasks (pending): {localTasks.filter(t => t.sync_status === 'pending').length}
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Todos (pending): {localTodos.filter(t => t.sync_status === 'pending').length}
          </Text>
        </View>

        {/* 日志 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>日志</Text>
          <ScrollView style={styles.logContainer}>
            {logs.map((log, index) => (
              <Text key={index} style={[styles.logText, { color: theme.textSecondary }]}>
                {log}
              </Text>
            ))}
          </ScrollView>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 5,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  logContainer: {
    maxHeight: 200,
  },
  logText: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
});
