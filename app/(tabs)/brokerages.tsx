import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, Chip, Searchbar, ActivityIndicator, Button } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { getBrokerageCompanies, searchBrokerages, type BrokerageCompany } from "../../lib/services/brokerage-service";
import { getBrokerageRatings } from "../../lib/services/rating-service";
import { SimpleLogo } from "../../components/SimpleLogo";

export default function BrokeragesScreen() {
  const router = useRouter();
  const [brokerages, setBrokerages] = useState<BrokerageCompany[]>([]);
  const [filteredBrokerages, setFilteredBrokerages] = useState<BrokerageCompany[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const specialties = [
    'Equity Trading',
    'Fixed Income',
    'Mutual Funds',
    'Pension Management',
    'Investment Advisory',
    'Alternative Investments',
    'Regional Securities'
  ];

  useEffect(() => {
    loadBrokerages();
  }, []);

  useEffect(() => {
    filterBrokerages();
  }, [searchQuery, selectedSpecialty, brokerages]);

  const loadBrokerages = async () => {
    try {
      setLoading(true);
      const data = await getBrokerageCompanies();
      setBrokerages(data);
    } catch (error) {
      console.error('Failed to load brokerages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBrokerages = async () => {
    let filtered = brokerages;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = await searchBrokerages(searchQuery);
    }

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(brokerage => 
        brokerage.specialties.some(specialty => 
          specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
        )
      );
    }

    setFilteredBrokerages(filtered);
  };

  const getStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 6; i++) {
      stars.push(
        <Text key={i} style={[styles.star, i <= rating ? styles.starFilled : styles.starEmpty]}>
          ★
        </Text>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={{ marginTop: 16 }}>Loading brokerage companies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SimpleLogo size="medium" showText={false} />
        <Text variant="headlineMedium">Jamaica Stock Brokers</Text>
        <Text variant="bodyMedium">Rate and review brokerage companies</Text>
      </View>

      {/* Search and Filters */}
      <Card style={styles.searchCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search brokerages..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchbar}
          />
          
          <View style={styles.specialtyChips}>
            <Chip
              mode={selectedSpecialty === null ? "flat" : "outlined"}
              onPress={() => setSelectedSpecialty(null)}
              style={styles.specialtyChip}
            >
              All Specialties
            </Chip>
            {specialties.map(specialty => (
              <Chip
                key={specialty}
                mode={selectedSpecialty === specialty ? "flat" : "outlined"}
                onPress={() => setSelectedSpecialty(specialty)}
                style={styles.specialtyChip}
              >
                {specialty}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Brokerage List */}
      <FlashList
        data={filteredBrokerages}
        keyExtractor={(item) => item.id}
        estimatedItemSize={200}
        renderItem={({ item }) => (
          <Card style={styles.brokerageCard}>
            <Card.Content>
              <View style={styles.brokerageHeader}>
                <View style={styles.brokerageInfo}>
                  <Text variant="titleLarge">{item.name}</Text>
                  <Text variant="bodyMedium" style={styles.website}>{item.website}</Text>
                  <Text variant="bodySmall" style={styles.established}>
                    Established: {item.established_year} • {item.regulatory_body}
                  </Text>
                </View>
                <View style={styles.ratingContainer}>
                  <View style={styles.starRating}>
                    {getStarRating(4.5)} {/* Placeholder rating */}
                  </View>
                  <Text variant="bodySmall" style={styles.ratingText}>
                    4.5/6 (23 reviews)
                  </Text>
                </View>
              </View>

              <Text variant="bodyMedium" style={styles.description}>
                {item.description}
              </Text>

              <View style={styles.specialtiesContainer}>
                <Text variant="labelMedium" style={styles.specialtiesLabel}>Specialties:</Text>
                <View style={styles.specialtiesChips}>
                  {item.specialties.slice(0, 3).map((specialty, index) => (
                    <Chip key={index} mode="outlined" compact style={styles.specialtyChip}>
                      {specialty}
                    </Chip>
                  ))}
                  {item.specialties.length > 3 && (
                    <Chip mode="outlined" compact style={styles.specialtyChip}>
                      +{item.specialties.length - 3} more
                    </Chip>
                  )}
                </View>
              </View>

              <View style={styles.servicesContainer}>
                <Text variant="labelMedium" style={styles.servicesLabel}>Services:</Text>
                <Text variant="bodySmall" style={styles.servicesText}>
                  {item.services.slice(0, 4).join(' • ')}
                  {item.services.length > 4 && ` • +${item.services.length - 4} more`}
                </Text>
              </View>

              <View style={styles.contactContainer}>
                <Text variant="labelMedium" style={styles.contactLabel}>Contact:</Text>
                <Text variant="bodySmall" style={styles.contactText}>
                  {item.contact_info.phone} • {item.contact_info.email}
                </Text>
              </View>

              <View style={styles.actionsContainer}>
                <Button
                  mode="contained"
                  onPress={() => router.push(`/brokerage/${item.id}`)}
                  style={styles.actionButton}
                  compact
                >
                  View Details
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => router.push(`/brokerage/${item.id}/rate`)}
                  style={styles.actionButton}
                  compact
                >
                  Rate & Review
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchCard: {
    margin: 16,
    marginBottom: 8,
  },
  searchbar: {
    marginBottom: 12,
  },
  specialtyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  brokerageCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  brokerageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  brokerageInfo: {
    flex: 1,
    marginRight: 12,
  },
  website: {
    color: '#1976D2',
    textDecorationLine: 'underline',
  },
  established: {
    color: '#666',
    marginTop: 4,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  starRating: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
  starFilled: {
    color: '#FFD700',
  },
  starEmpty: {
    color: '#E0E0E0',
  },
  ratingText: {
    color: '#666',
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  specialtiesContainer: {
    marginBottom: 12,
  },
  specialtiesLabel: {
    marginBottom: 6,
    fontWeight: '600',
  },
  specialtiesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  servicesContainer: {
    marginBottom: 12,
  },
  servicesLabel: {
    marginBottom: 4,
    fontWeight: '600',
  },
  servicesText: {
    color: '#666',
    lineHeight: 18,
  },
  contactContainer: {
    marginBottom: 16,
  },
  contactLabel: {
    marginBottom: 4,
    fontWeight: '600',
  },
  contactText: {
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
