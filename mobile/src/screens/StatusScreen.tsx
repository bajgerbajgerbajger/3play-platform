import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar,
  Dimensions
} from 'react-native';
import { Terminal, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';
import client from '../api/client';

interface Log {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface StatusData {
  status: {
    isUpdating: boolean;
    progress: number;
    estimatedTime: string | null;
    message: string;
    updatedAt: string;
  };
  logs: Log[];
}

export default function StatusScreen() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const fetchStatus = async () => {
    try {
      const response = await client.get('/system-status');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  const { status, logs } = data!;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>STAV SYSTÉMU</Text>
          <View style={[styles.statusBadge, { borderColor: status.isUpdating ? '#EAB308' : '#22C55E' }]}>
            <View style={[styles.dot, { backgroundColor: status.isUpdating ? '#EAB308' : '#22C55E' }]} />
            <Text style={[styles.statusText, { color: status.isUpdating ? '#EAB308' : '#22C55E' }]}>
              {status.isUpdating ? 'AKTUALIZACE' : 'ONLINE'}
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Activity size={20} color="#3B82F6" />
            <Text style={styles.cardLabel}>Průběh</Text>
            <Text style={styles.cardValue}>{status.progress}%</Text>
          </View>
          <View style={styles.card}>
            <Clock size={20} color="#A855F7" />
            <Text style={styles.cardLabel}>Odhad</Text>
            <Text style={styles.cardValue}>{status.estimatedTime || '--:--'}</Text>
          </View>
        </View>

        <View style={styles.messageBox}>
          <View style={styles.messageHeader}>
            {status.isUpdating ? (
              <AlertCircle size={24} color="#EAB308" />
            ) : (
              <CheckCircle size={24} color="#22C55E" />
            )}
            <Text style={styles.messageTitle}>Aktuální zpráva</Text>
          </View>
          <Text style={styles.messageContent}>{status.message}</Text>
        </View>

        <View style={styles.terminalHeader}>
          <Terminal size={18} color="#E50914" />
          <Text style={styles.terminalTitle}>SYSTÉMOVÉ LOGY</Text>
        </View>
        
        <View style={styles.terminal}>
          <ScrollView 
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            style={styles.terminalScroll}
          >
            {logs.map((log) => (
              <View key={log.id} style={styles.logLine}>
                <Text style={styles.logTime}>
                  [{new Date(log.timestamp).toLocaleTimeString('cs-CZ', { hour12: false })}]
                </Text>
                <Text style={[
                  styles.logMessage,
                  log.type === 'success' && { color: '#4ADE80' },
                  log.type === 'error' && { color: '#F87171' },
                  log.type === 'warning' && { color: '#FACC15' },
                ]}>
                  {log.message}
                </Text>
              </View>
            ))}
            {logs.length === 0 && (
              <Text style={styles.emptyLogs}>Čekání na data...</Text>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  centered: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  cardLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  cardValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  messageBox: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 24,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  messageTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageContent: {
    color: '#AAA',
    lineHeight: 20,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  terminalTitle: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  terminal: {
    backgroundColor: 'black',
    borderRadius: 16,
    padding: 16,
    height: 250,
    borderWidth: 1,
    borderColor: '#222',
  },
  terminalScroll: {
    flex: 1,
  },
  logLine: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 8,
  },
  logTime: {
    color: '#444',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  logMessage: {
    color: '#3B82F6',
    fontFamily: 'monospace',
    fontSize: 12,
    flex: 1,
  },
  emptyLogs: {
    color: '#333',
    fontStyle: 'italic',
    fontSize: 12,
  }
});
