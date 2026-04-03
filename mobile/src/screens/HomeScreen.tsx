import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Play, LogOut, Film, Tv, Activity } from 'lucide-react-native';
import { movieService } from '../api/movies';
import { authService } from '../api/auth';
import { Movie } from '../types';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

export default function HomeScreen({ navigation, onLogout }: { navigation: any, onLogout: () => void }) {
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    const data = await movieService.getMovies();
    setMovies(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.logoSmall}>
          <View style={styles.logoIconSmall}>
            <Play size={16} color="white" fill="white" />
          </View>
          <Text style={styles.logoTextSmall}>3PLAY</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <LogOut size={24} color="#E50914" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Film size={20} color="white" />
          <Text style={styles.tabText}>Filmy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Tv size={20} color="#666" />
          <Text style={[styles.tabText, { color: '#666' }]}>Seriály</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => alert('Stav systému: Všechny systémy běží.')}
        >
          <Activity size={20} color="#666" />
          <Text style={[styles.tabText, { color: '#666' }]}>Stav</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.movieList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.movieCard}
              onPress={() => navigation.navigate('Player', { movie: item })}
            >
              <Image 
                source={{ uri: item.posterUrl || 'https://via.placeholder.com/300x450' }} 
                style={styles.poster}
              />
              <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.movieYear}>{item.releaseYear}</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconSmall: {
    width: 28,
    height: 28,
    backgroundColor: '#E50914',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoTextSmall: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#E50914',
  },
  tabText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  movieList: {
    padding: 16,
  },
  movieCard: {
    width: ITEM_WIDTH,
    margin: 8,
  },
  poster: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.5,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  movieTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  movieYear: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
});
