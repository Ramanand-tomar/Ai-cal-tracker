import Colors from '@/constants/Colors';
import { searchFood } from '@/utils/fatSecretApi';
import { useRouter } from 'expo-router';
import { ArrowLeft01Icon, PlusSignIcon, Search01Icon } from 'hugeicons-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
// Since we might not have use-debounce installed, let's implement a simple useEffect debounce or just manual.

// Define Food Interface based on FatSecret API response
interface FoodItem {
  food_id: string;
  food_name: string;
  food_description: string; // e.g. "Per 100g - Calories: 52kcal | Fat: 0.17g | Carbs: 13.81g | Protein: 0.26g"
  brand_name?: string;
  food_type?: string;
}

export default function FoodSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false); // To show loading specifically for search

  // Simple debounce logic
  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
        const foods = await searchFood(text);
        setResults(foods);
    } catch (error) {
        console.error("Search failed", error);
    } finally {
        setSearching(false);
    }
  };

  // Debouncing effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
        if (query.length >= 3) {
            handleSearch(query);
        }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [query]);

  const renderFoodItem = ({ item }: { item: FoodItem }) => {
    // Parse calories from description if needed, or just display description
    // Description format: "Per 100g - Calories: 52kcal | Fat: 0.17g ..."
    // Let's try to extract Calories for a cleaner UI if possible, or just show the description line.
    
    // Extract calories regex
    const calMatch = item.food_description.match(/Calories:\s*(\d+)kcal/);
    const calories = calMatch ? calMatch[1] : '?';

    // Extract serving size (part before " - ")
    const servingSize = item.food_description.split(' - ')[0] || 'Serving';

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.foodName}>{item.food_name}</Text>
          {item.brand_name && <Text style={styles.brandName}>{item.brand_name}</Text>}
          <Text style={styles.foodDescription} numberOfLines={2}>
            {servingSize} • {calories} kcal
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => router.push({
            pathname: "/log-food",
            params: { foodId: item.food_id }
          })}
        >
            <PlusSignIcon size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ArrowLeft01Icon size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Food</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
            <Search01Icon size={20} color="#9CA3AF" />
            <TextInput
                style={styles.input}
                placeholder="Search food (e.g. Apple, Big Mac)"
                value={query}
                onChangeText={setQuery}
                placeholderTextColor="#9CA3AF"
                autoFocus
            />
            {searching && <ActivityIndicator size="small" color={Colors.light.primary} />}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {query.length > 0 && query.length < 3 && (
            <Text style={styles.hintText}>Type at least 3 characters...</Text>
        )}

        <FlatList
            data={results}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.food_id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                query.length >= 3 && !searching ? (
                    <Text style={styles.emptyText}>No results found.</Text>
                ) : null
            }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 50,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.primary,
    marginBottom: 2,
  },
  foodDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 20,
  },
});
