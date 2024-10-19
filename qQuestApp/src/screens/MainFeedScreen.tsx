import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Circle {
  id: string;
  title: string;
  description: string;
  creator: {
    name: string;
    avatar: string;
    tier: string;
  };
  raised: number;
  goal: number;
  timeRemaining: string;
  backers: string[];
  termPeriod: string;
  builderScore: number;
}

const circles: Circle[] = [
  {
    id: '1',
    title: 'Buy sneakers',
    description: 'For new Travis Scott sneakers',
    creator: { name: 'Jesse Pollak', avatar: 'https://example.com/avatar1.jpg', tier: 'Ally' },
    raised: 250,
    goal: 1000,
    timeRemaining: '6 Days remaining',
    backers: ['https://example.com/backer1.jpg', 'https://example.com/backer2.jpg', 'https://example.com/backer3.jpg'],
    termPeriod: '2 Months',
    builderScore: 723,
  },
  {
    id: '2',
    title: 'Buy groceries',
    description: 'For weekend barbecue',
    creator: { name: 'Ella Davis', avatar: 'https://example.com/avatar2.jpg', tier: 'John' },
    raised: 240,
    goal: 300,
    timeRemaining: '3 Days left',
    backers: ['https://example.com/backer4.jpg', 'https://example.com/backer5.jpg', 'https://example.com/backer6.jpg'],
    termPeriod: '2 Months',
    builderScore: 128,
  },
  {
    id: '3',
    title: 'Book flight',
    description: 'To Paris for vacation',
    creator: { name: 'Sophie Johnson', avatar: 'https://example.com/avatar3.jpg', tier: 'Emily' },
    raised: 500,
    goal: 1000,
    timeRemaining: '1 Week',
    backers: ['https://example.com/backer7.jpg', 'https://example.com/backer8.jpg'],
    termPeriod: '2 Months',
    builderScore: 543,
  },
];

export default function MainFeedScreen() {
  const navigation = useNavigation();

  const renderCircleCard = ({ item }: { item: Circle }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </View>
        <Text style={styles.termPeriod}>Term period {item.termPeriod}</Text>
      </View>
      <View style={styles.creatorInfo}>
        <Image source={{ uri: item.creator.avatar }} style={styles.avatar} />
        <Text style={styles.creatorName}>{item.creator.name}</Text>
        <Text style={styles.creatorTier}>{item.creator.tier}</Text>
        <View style={styles.builderScoreContainer}>
          <Feather name="check-circle" size={16} color="#3B82F6" />
          <Text style={styles.builderScore}>{item.builderScore}</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <Text style={styles.raisedAmount}>${item.raised}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${(item.raised / item.goal) * 100}%` }]} />
        </View>
        <Text style={styles.goalAmount}>${item.goal}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.timeRemaining}>{item.timeRemaining}</Text>
        <TouchableOpacity style={styles.fundButton}>
          <Text style={styles.fundButtonText}>Fund now</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.backersContainer}>
        {item.backers.slice(0, 3).map((backer, index) => (
          <Image key={index} source={{ uri: backer }} style={styles.backerAvatar} />
        ))}
        {item.backers.length > 3 && (
          <View style={styles.extraBackers}>
            <Text style={styles.extraBackersText}>+{item.backers.length - 3}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>qQuest</Text>
        <TouchableOpacity>
          <Feather name="bell" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={circles}
        renderItem={renderCircleCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateCircle' as never)}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="home" size={24} color="#3B82F6" />
          <Text style={[styles.tabText, styles.activeTabText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="bar-chart-2" size={24} color="#888" />
          <Text style={styles.tabText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="gift" size={24} color="#888" />
          <Text style={styles.tabText}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="user" size={24} color="#888" />
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>
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
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardDescription: {
    fontSize: 14,
    color: '#888',
  },
  termPeriod: {
    fontSize: 12,
    color: '#888',
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  creatorName: {
    fontSize: 14,
    color: '#fff',
    marginRight: 8,
  },
  creatorTier: {
    fontSize: 12,
    color: '#3B82F6',
    marginRight: 8,
  },
  builderScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  builderScore: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  raisedAmount: {
    fontSize: 14,
    color: '#fff',
    marginRight: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  goalAmount: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeRemaining: {
    fontSize: 12,
    color: '#888',
  },
  fundButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fundButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  backersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: -8,
    borderWidth: 2,
    borderColor: '#111',
  },
  extraBackers: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  extraBackersText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  createButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  activeTabText: {
    color: '#3B82F6',
  },
});