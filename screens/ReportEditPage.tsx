import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import { API_BASE_URL } from '../config';

const ReportEditPage = ({ route, navigation }) => {
  const { reportId } = route.params;

  const [message, setMessage] = useState('');
  const [type, setType] = useState(null);
  const [typeOptions, setTypeOptions] = useState([]);

  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [stopsOptions, setStopsOptions] = useState([]);
  const [routesOptions, setRoutesOptions] = useState([]);

  const [openType, setOpenType] = useState(false);
  const [openStop, setOpenStop] = useState(false);
  const [openRoute, setOpenRoute] = useState(false);

  const [activeTab, setActiveTab] = useState<'arret' | 'ligne'>('arret');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleOpen = (target: 'type' | 'stop' | 'route') => {
    setOpenType(target === 'type');
    setOpenStop(target === 'stop');
    setOpenRoute(target === 'route');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        const res = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erreur inconnue');

        setMessage(data.data.rep_message);
        setType(data.data.rep_type);
        setSelectedStop(data.data.rep_sto_id);
        setSelectedRoute(data.data.rep_rou_id);
        setActiveTab(data.data.rep_sto_id ? 'arret' : 'ligne');

        const [typesRes, stopsRes, routesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/reports/types`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/stops/all`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/routes/all`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const typesData = await typesRes.json();
        const stopsData = await stopsRes.json();
        const routesData = await routesRes.json();

        if (typesRes.ok) {
          setTypeOptions(typesData.data.map(t => ({ label: t, value: t })));
        }

        if (stopsRes.ok) {
          setStopsOptions(
            stopsData.data
              .sort((a, b) => a.sto_name.localeCompare(b.sto_name, 'fr', { numeric: true }))
              .map((stop) => ({ label: stop.sto_name, value: stop.sto_id }))
          );
        }

        if (routesRes.ok) {
          setRoutesOptions(
            routesData.data
              .sort((a, b) => a.rou_code.localeCompare(b.rou_code, 'fr', { numeric: true }))
              .map((route) => ({ label: route.rou_code, value: route.rou_id }))
          );
        }

        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement signalement:', err);
        Alert.alert('Erreur', 'Impossible de charger le signalement.');
        navigation.goBack();
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');

      const body = {
        rep_message: message,
        rep_type: type,
        rep_sto_id: activeTab === 'arret' ? selectedStop : null,
        rep_rou_id: activeTab === 'ligne' ? selectedRoute : null,
      };

      const res = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert('Succès', 'Signalement modifié.');
        navigation.goBack();
      } else {
        Alert.alert('Erreur', data.message || 'Erreur lors de la modification.');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Échec de la modification.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#fd5312" />
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Modifier le signalement</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'arret' && styles.activeTab]}
            disabled={true}
          >
            <Text style={[styles.tabText, activeTab === 'arret' && styles.activeTabText]}>Arrêts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ligne' && styles.activeTab]}
            disabled={true}
          >
            <Text style={[styles.tabText, activeTab === 'ligne' && styles.activeTabText]}>Lignes</Text>
          </TouchableOpacity>
        </View>



        {activeTab === 'arret' && (
          <DropDownPicker
            open={openStop}
            value={selectedStop}
            items={stopsOptions}
            setOpen={(val) => handleOpen(val ? 'stop' : '')}
            setValue={setSelectedStop}
            setItems={setStopsOptions}
            placeholder="Choisir un arrêt"
            searchable
            listMode="SCROLLVIEW"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList}
            zIndex={3000}
          />
        )}

        {activeTab === 'ligne' && (
          <DropDownPicker
            open={openRoute}
            value={selectedRoute}
            items={routesOptions}
            setOpen={(val) => handleOpen(val ? 'route' : '')}
            setValue={setSelectedRoute}
            setItems={setRoutesOptions}
            placeholder="Choisir une ligne"
            searchable
            listMode="SCROLLVIEW"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList}
            zIndex={3000}
          />
        )}

        <DropDownPicker
          open={openType}
          value={type}
          items={typeOptions}
          setOpen={(val) => handleOpen(val ? 'type' : '')}
          setValue={setType}
          setItems={setTypeOptions}
          placeholder="Type de dégât"
          listMode="SCROLLVIEW"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          zIndex={2000}
        />

        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Décrivez le problème..."
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={saving}>
          {saving
            ? <ActivityIndicator color="white" />
            : <Text style={styles.submitText}>Enregistrer les modifications</Text>}
        </TouchableOpacity>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fd5312', marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
    padding: 12, marginBottom: 15,
  },
  messageInput: { height: 120, textAlignVertical: 'top' },
  dropdown: { marginBottom: 15, borderRadius: 10 },
  dropdownList: { borderRadius: 10 },
  submitButton: {
    backgroundColor: '#fd5312', paddingVertical: 14,
    borderRadius: 10, alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backButton: { marginBottom: 10 },
  backText: { color: '#fd5312', fontSize: 16, fontWeight: '600' },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15, gap: 10 },
  tab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999, backgroundColor: '#eee' },
  tabText: { color: '#555', fontWeight: '600' },
  activeTab: {
    backgroundColor: '#fd5312',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  activeTabText: { color: '#fff' },
});

export default ReportEditPage;
