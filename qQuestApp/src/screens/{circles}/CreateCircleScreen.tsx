import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NavigationProp } from '@react-navigation/native';

interface CreateCircleScreenProps {
  navigation: NavigationProp<any>;
}

export default function CreateCircleScreen({ navigation }: CreateCircleScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [leadTime, setLeadTime] = useState(new Date());
  const [repaymentDuration, setRepaymentDuration] = useState(new Date());
  const [amount, setAmount] = useState(1200);
  const [showLeadTimePicker, setShowLeadTimePicker] = useState(false);
  const [showRepaymentPicker, setShowRepaymentPicker] = useState(false);

  const handleCreateCircle = () => {
    // Implement circle creation logic here
    console.log('Circle created:', { title, description, leadTime, repaymentDuration, amount });
    navigation.goBack();
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleDateChange = (
    setDate: React.Dispatch<React.SetStateAction<Date>>,
    setShowPicker: React.Dispatch<React.SetStateAction<boolean>>
  ) => (event: Event, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create circle</Text>
        <TouchableOpacity>
          <Feather name="bell" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>Create new circle</Text>
        <Text style={styles.description}>Submit your leave details below</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="eg: Buy sneakers"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Add description"
          placeholderTextColor="#666"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Lead time</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowLeadTimePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(leadTime)}</Text>
              <Feather name="chevron-down" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Repayment Duration</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowRepaymentPicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(repaymentDuration)}</Text>
              <Feather name="chevron-down" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {showLeadTimePicker && (
          <DateTimePicker
            value={leadTime}
            mode="date"
            display="default"
            onChange={handleDateChange(setLeadTime, setShowLeadTimePicker)}
          />
        )}

        {showRepaymentPicker && (
          <DateTimePicker
            value={repaymentDuration}
            mode="date"
            display="default"
            onChange={handleDateChange(setRepaymentDuration, setShowRepaymentPicker)}
          />
        )}

        <Text style={styles.label}>Amount</Text>
        <Slider
          style={styles.slider}
          minimumValue={100}
          maximumValue={10000}
          step={100}
          value={amount}
          onValueChange={setAmount}
          minimumTrackTintColor="#3B82F6"
          maximumTrackTintColor="#666"
          thumbTintColor="#3B82F6"
        />

        <View style={styles.row}>
          <Text style={styles.label}>Collateral</Text>
          <View style={styles.collateralContainer}>
            <Text style={styles.collateralText}>0.7 ETH</Text>
            <Text style={styles.collateralValue}>${amount.toFixed(0)}</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateCircle}>
        <Text style={styles.createButtonText}>Create Circle</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfWidth: {
    width: '48%',
  },
  dateInput: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
  collateralContainer: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collateralText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  collateralValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 15,
    margin: 20,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});