import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../config';
import { useRoute } from '@react-navigation/native';

const ReportPage = () => {
  const route = useRoute();
  const preselectedStopId = route.params?.selectedStopId ?? null;

  const [activeTab, setActiveTab] = useState<'arret' | 'ligne'>(preselectedStopId ? 'arret' : 'ligne');

  const [message, setMessage] = useState('');
  const [type, setType] = useState(null);
  const [typeOptions, setTypeOptions] = useState([]);
  const [routesOptions, setRoutesOptions] = useState([]);
  const [stopsOptions, setStopsOptions] = useState([]);
  const [selectedStop, setSelectedStop] = useState(preselectedStopId);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const [openStop, setOpenStop] = useState(false);
  const [openRoute, setOpenRoute] = useState(false);
  const [openType, setOpenType] = useState(false);

  const [location, setLocation] = useState(null);

  const handleOpen = (target) => {
    setOpenStop(target === 'stop');
    setOpenRoute(target === 'route');
    setOpenType(target === 'type');
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');

      const [stopsRes, routesRes, typesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/stops/all`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/routes/all`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/reports/types`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const stopsData = await stopsRes.json();
      const routesData = await routesRes.json();
      const typesData = await typesRes.json();

      setStopsOptions(
        stopsData.data
          .sort((a, b) => a.sto_name.localeCompare(b.sto_name, 'fr', { numeric: true }))
          .map((stop) => ({ label: stop.sto_name, value: stop.sto_id }))
      );

      setRoutesOptions(
        routesData.data
          .sort((a, b) => a.rou_code.localeCompare(b.rou_code, 'fr', { numeric: true }))
          .map((route) => ({ label: route.rou_code, value: route.rou_id }))
      );

      setTypeOptions(typesData.data.map((item) => ({ label: item, value: item })));
    };

    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    };

    fetchData();
    getLocation();
  }, []);

  useEffect(() => {
    if (!preselectedStopId) setSelectedStop(null);
    setSelectedRoute(null);
    setType(null);
    setMessage('');
    setOpenStop(false);
    setOpenRoute(false);
    setOpenType(false);
  }, [activeTab]);

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('token');
    const body = {
      rep_sto_id: activeTab === 'arret' ? selectedStop : null,
      rep_rou_id: activeTab === 'ligne' ? selectedRoute : null,
      rep_type: type,
      rep_message: message,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
    };

    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      Alert.alert('Succès', 'Le signalement a été envoyé.');
      setMessage('');
      setType(null);
      setSelectedRoute(null);
      setSelectedStop(preselectedStopId ?? null);
    } else {
      Alert.alert('Erreur', data.message || 'Une erreur est survenue.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Créer un signalement</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'arret' && styles.activeTab]}
            onPress={() => setActiveTab('arret')}
          >
            <Text style={[styles.tabText, activeTab === 'arret' && styles.activeTabText]}>Arrêts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ligne' && styles.activeTab]}
            onPress={() => setActiveTab('ligne')}
          >
            <Text style={[styles.tabText, activeTab === 'ligne' && styles.activeTabText]}>Lignes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {activeTab === 'arret' && (
            <DropDownPicker
              open={openStop}
              value={selectedStop}
              items={stopsOptions}
              setOpen={(val) => handleOpen(val ? 'stop' : '')}
              setValue={setSelectedStop}
              setItems={setStopsOptions}
              searchable
              listMode="SCROLLVIEW"
              placeholder="Rechercher un arrêt"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              onSelectItem={() => setOpenStop(false)}
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
              searchable
              listMode="SCROLLVIEW"
              placeholder="Rechercher une ligne"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              onSelectItem={() => setOpenRoute(false)}
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
            listMode="SCROLLVIEW"
            placeholder="Type de dégât"
            searchable={false}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList}
            onSelectItem={() => setOpenType(false)}
            zIndex={2000}
          />

          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Décrivez le problème..."
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Envoyer le signalement</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#fd5312',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 20, gap: 10 },
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
  form: { paddingHorizontal: 20, zIndex: 1000 },
  dropdown: { marginBottom: 15, borderRadius: 10 },
  dropdownList: { borderRadius: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#fd5312',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReportPage;
