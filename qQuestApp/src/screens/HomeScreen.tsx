import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [builderScore, setBuilderScore] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (walletConnected && walletAddress) {
      checkBuilderScore(walletAddress);
    }
  }, [walletConnected, walletAddress]);

  const connectWallet = async () => {
    try {
      // Implement wallet connection logic here
      // This is a placeholder, replace with actual wallet connection code
      const address = "0x1234..."; // This should be the actual connected wallet address
      setWalletAddress(address);
      setWalletConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const checkBuilderScore = async (address: string) => {
    try {
      const response = await fetch(`https://api.talentprotocol.com/api/v2/passports/${address}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setBuilderScore(data.builderScore);
    } catch (error) {
      console.error('Error fetching builder score:', error);
      setBuilderScore(null);
    }
  };

  const renderContent = () => {
    if (!walletConnected) {
      return (
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome to qQuest</Text>
          <Text style={styles.titleText}>P2P interest free funding circles for crypto</Text>
          <Text style={styles.subtitleText}>Keep your assets, get liquidity</Text>
          <TouchableOpacity style={styles.button} onPress={connectWallet}>
            <Text style={styles.buttonText}>🔗 Connect Wallet</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimerText}>
            By connecting, I accept the Terms & Conditions and Privacy Policy
          </Text>
        </View>
      );
    } else if (builderScore === null) {
      return (
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading your builder score...</Text>
        </View>
      );
    } else if (builderScore === 0) {
      return (
        <View style={styles.content}>
          <Image
            source={require('./assets/talent-protocol-logo.png')}
            style={styles.logo}
          />
          <Text style={styles.errorTitle}>Your builder score is zero</Text>
          <Text style={styles.errorSubtitle}>
            We've connected to your Talent Passport. Focus on increasing your on-chain contributions to boost your score.
          </Text>
        </View>
      );
    } else if (builderScore < 25) {
      return (
        <View style={styles.content}>
          <Image
            source={require('./assets/talent-protocol-logo.png')}
            style={styles.logo}
          />
          <Text style={styles.errorTitle}>
            Your Builder Score is below the minimum of 25.
          </Text>
          <Text style={styles.errorSubtitle}>
            To boost your score and unlock more features, focus on increasing your on-chain contributions.
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.content}>
          <Text style={styles.successTitle}>Welcome to qQuest!</Text>
          <Text style={styles.successSubtitle}>
            Your Builder Score of {builderScore} qualifies you for our services.
          </Text>
          {/* Add navigation to main app features here */}
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.statusBarText}>9:09</Text>
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  statusBar: {
    height: 44,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  statusBarText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#3B82F6',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
});

export default HomeScreen;