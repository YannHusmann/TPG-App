import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { Ionicons } from '@expo/vector-icons';

const ReportsListPage = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);

  const fetchReports = async () => {
    const token = await AsyncStorage.getItem('token');
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);

    const res = await fetch(`${API_BASE_URL}/reports/filter?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) setReports(data.data.data || []);
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleDelete = async (id) => {
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      Alert.alert('Supprimé', 'Le signalement a été supprimé.');
      fetchReports();
    } else {
      Alert.alert('Erreur', 'Impossible de supprimer ce signalement.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.reportCard}>
      <Text style={styles.scope}>{item.rep_sto_id ? 'Arrêt' : 'Ligne'}</Text>
      {item.rep_sto_id && item.stop && (
        <Text style={styles.targetText}>• {item.stop.sto_name}</Text>
      )}
      {item.rep_rou_id && item.route && (
        <Text style={styles.targetText}>• Ligne {item.route.rou_code}</Text>
      )}
      <Text style={styles.title}>{item.rep_type}</Text>
      <Text style={styles.message}>{item.rep_message}</Text>
      <Text style={styles.status}>Statut : {item.rep_status}</Text>
      {item.rep_status === 'envoyé' && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => navigation.navigate('ReportEditPage', { reportId: item.rep_id })}>
            <Ionicons name="create-outline" size={20} color="#fd5312" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.rep_id)}>
            <Ionicons name="trash-outline" size={20} color="red" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>Mes signalements</Text>

      <View style={styles.filters}>
        <TouchableOpacity onPress={() => setStatusFilter(null)}>
          <Text style={[styles.filterBtn, statusFilter === null && styles.activeFilter]}>Tous</Text>
        </TouchableOpacity>
        {['envoyé', 'en traitement', 'traité'].map(status => (
          <TouchableOpacity key={status} onPress={() => setStatusFilter(status)}>
            <Text style={[styles.filterBtn, statusFilter === status && styles.activeFilter]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.rep_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  backButton: { marginTop: 10, marginBottom: 10 },
  backText: { color: '#fd5312', fontSize: 16, fontWeight: '600' },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fd5312',
    marginBottom: 20,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 10,
  },
  filterBtn: { color: '#555', fontSize: 14 },
  activeFilter: { fontWeight: 'bold', color: '#fd5312' },
  reportCard: {
    backgroundColor: '#fafafa',
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
    elevation: 1,
  },
  scope: {
    color: '#fd5312',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  targetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  message: { marginTop: 6, color: '#444' },
  status: { marginTop: 8, fontStyle: 'italic', color: '#666' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
});

export default ReportsListPage;
