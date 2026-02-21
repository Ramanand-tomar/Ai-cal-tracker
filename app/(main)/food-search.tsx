import AppLoader from "@/components/ui/AppLoader";
import BackButton from "@/components/ui/BackButton";
import { useTheme } from "@/context/ThemeContext";
import { fatsecretService } from "@/services/fatsecretService";
import { useRouter } from "expo-router";
import {
    FilterHorizontalIcon,
    Search01Icon
} from "hugeicons-react-native";
import { useEffect, useRef, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FoodSearchScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const searchTimeout = useRef<any>(null);

    const performSearch = async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await fatsecretService.searchFoods(query);
            setResults(data);
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (searchQuery.length > 2) {
            searchTimeout.current = setTimeout(() => {
                performSearch(searchQuery);
            }, 500); // 500ms debounce
        } else if (searchQuery.length === 0) {
            setResults([]);
        }

        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [searchQuery]);

    const filteredResults = results;

    const renderFoodItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View 
            entering={FadeInDown.delay(index * 100).duration(400)}
            style={[styles.foodCard, { backgroundColor: isDark ? colors.surface : 'white', borderColor: colors.border }]}
        >
            <TouchableOpacity 
                style={styles.foodCardContent}
                onPress={() => router.push({
                    pathname: "/(main)/log-food",
                    params: { 
                        foodId: item.id, 
                        name: item.name, 
                        calories: item.calories,
                        protein: item.protein,
                        carbs: item.carbs,
                        fats: item.fats,
                        unit: item.unit
                    }
                })}
            >
                <View style={styles.textContainer}>
                    <Text style={[styles.foodName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.foodBrand, { color: colors.textMuted }]}>{item.brand} • {item.unit}</Text>
                    <View style={styles.macroRow}>
                        <Text style={[styles.macroText, { color: colors.textSecondary }]}>P: {item.protein}g</Text>
                        <Text style={[styles.macroSeparator, { color: colors.border }]}>|</Text>
                        <Text style={[styles.macroText, { color: colors.textSecondary }]}>C: {item.carbs}g</Text>
                        <Text style={[styles.macroSeparator, { color: colors.border }]}>|</Text>
                        <Text style={[styles.macroText, { color: colors.textSecondary }]}>F: {item.fats}g</Text>
                    </View>
                </View>
                <View style={[styles.calorieBadge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4' }]}>
                    <Text style={[styles.calorieText, { color: isDark ? '#10B981' : colors.primary }]}>{item.calories}</Text>
                    <Text style={[styles.kcalText, { color: isDark ? '#10B981' : colors.primary }]}>kcal</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <BackButton />
                <Text style={[styles.headerTitle, { color: colors.text }]}>Search Food</Text>
                <TouchableOpacity style={[styles.filterButton, { backgroundColor: isDark ? colors.surface : '#F8FAFC' }]}>
                    <FilterHorizontalIcon size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: isDark ? colors.surface : '#F1F5F9' }]}>
                    <Search01Icon size={20} color={colors.textMuted} />
                    <TextInput 
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search for a food..."
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.centerContainer}>
                        <AppLoader size={120} label="Searching for food..." />
                    </View>
                ) : filteredResults.length > 0 ? (
                    <FlatList 
                        data={filteredResults}
                        renderItem={renderFoodItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.centerContainer}>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>
                            {searchQuery.length > 0 ? "No results found" : "Search for any food"}
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                            {searchQuery.length > 0 
                                ? "Try searching for something else" 
                                : "Type at least 3 characters to start searching"}
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    foodCard: {
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    foodCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    textContainer: {
        flex: 1,
    },
    foodName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    foodBrand: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
    },
    macroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    macroText: {
        fontSize: 12,
        fontWeight: '600',
    },
    macroSeparator: {
        fontSize: 12,
    },
    calorieBadge: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        minWidth: 60,
    },
    calorieText: {
        fontSize: 16,
        fontWeight: '800',
    },
    kcalText: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: -2,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
});
