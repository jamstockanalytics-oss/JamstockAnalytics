import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Linking } from "react-native";
import { Text, Card, Chip, Button, ActivityIndicator, Divider, ProgressBar } from "react-native-paper";
import { getBrokerageById, type BrokerageCompany } from "../../lib/services/brokerage-service";
import { getBrokerageRatings, getRecentRatings, type RatingStats } from "../../lib/services/rating-service";
import { SimpleLogo } from "../../components/SimpleLogo";

export default function BrokerageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [brokerage, setBrokerage] = useState<BrokerageCompany | null>(null);
  const [ratings, setRatings] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrokerageData();
  }, [id]);

  const loadBrokerageData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [brokerageData, ratingsData] = await Promise.all([
        getBrokerageById(id),
        getBrokerageRatings(id)
      ]);
      
      setBrokerage(brokerageData);
      setRatings(ratingsData);
    } catch (error) {
      console.error('Failed to load brokerage data:', error);
    } finally {
      setLoading(false);
    }
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

  const openWebsite = () => {
    if (brokerage?.website) {
      Linking.openURL(brokerage.website);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={{ marginTop: 16 }}>Loading brokerage details...</Text>
      </View>
    );
  }

  if (!brokerage) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge">Brokerage not found.</Text>
        <Button mode="outlined" onPress={() => router.back()} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <SimpleLogo size="medium" showText={false} />
        <Text variant="headlineMedium">{brokerage.name}</Text>
        <Text variant="bodyMedium" style={styles.website} onPress={openWebsite}>
          {brokerage.website}
        </Text>
      </View>

      {/* Rating Summary */}
      {ratings && (
        <Card style={styles.ratingCard}>
          <Card.Content>
            <View style={styles.ratingHeader}>
              <View style={styles.ratingScore}>
                <Text variant="headlineLarge" style={styles.ratingNumber}>
                  {ratings.average_rating}
                </Text>
                <View style={styles.starRating}>
                  {getStarRating(Math.round(ratings.average_rating))}
                </View>
                <Text variant="bodySmall" style={styles.ratingCount}>
                  Based on {ratings.total_ratings} reviews
                </Text>
              </View>
              <View style={styles.ratingBreakdown}>
                {[6, 5, 4, 3, 2, 1].map(star => (
                  <View key={star} style={styles.ratingBar}>
                    <Text variant="bodySmall">{star}★</Text>
                    <ProgressBar 
                      progress={ratings.rating_breakdown[star.toString() as keyof typeof ratings.rating_breakdown] / ratings.total_ratings} 
                      style={styles.progressBar}
                    />
                    <Text variant="bodySmall">
                      {ratings.rating_breakdown[star.toString() as keyof typeof ratings.rating_breakdown]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Company Information */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Company Information</Text>
          <Text variant="bodyMedium" style={styles.description}>
            {brokerage.description}
          </Text>
          
          <View style={styles.infoRow}>
            <Text variant="labelMedium">Established:</Text>
            <Text variant="bodyMedium">{brokerage.established_year}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text variant="labelMedium">Regulatory Body:</Text>
            <Text variant="bodyMedium">{brokerage.regulatory_body}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text variant="labelMedium">JSE Member:</Text>
            <Text variant="bodyMedium">{brokerage.jse_member ? 'Yes' : 'No'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text variant="labelMedium">Minimum Investment:</Text>
            <Text variant="bodyMedium">{brokerage.minimum_investment}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Services */}
      <Card style={styles.servicesCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Services Offered</Text>
          <View style={styles.servicesGrid}>
            {brokerage.services.map((service, index) => (
              <Chip key={index} mode="outlined" style={styles.serviceChip}>
                {service}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Specialties */}
      <Card style={styles.specialtiesCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.specialtiesGrid}>
            {brokerage.specialties.map((specialty, index) => (
              <Chip key={index} mode="flat" style={styles.specialtyChip}>
                {specialty}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Trading Platforms */}
      <Card style={styles.platformsCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Trading Platforms</Text>
          <View style={styles.platformsList}>
            {brokerage.trading_platforms.map((platform, index) => (
              <View key={index} style={styles.platformItem}>
                <Text variant="bodyMedium">• {platform}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Research Services */}
      <Card style={styles.researchCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Research Services</Text>
          <View style={styles.researchList}>
            {brokerage.research_services.map((service, index) => (
              <View key={index} style={styles.researchItem}>
                <Text variant="bodyMedium">• {service}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Contact Information */}
      <Card style={styles.contactCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.contactItem}>
            <Text variant="labelMedium">Phone:</Text>
            <Text variant="bodyMedium" style={styles.contactValue}>
              {brokerage.contact_info.phone}
            </Text>
          </View>
          
          <View style={styles.contactItem}>
            <Text variant="labelMedium">Email:</Text>
            <Text variant="bodyMedium" style={styles.contactValue}>
              {brokerage.contact_info.email}
            </Text>
          </View>
          
          <View style={styles.contactItem}>
            <Text variant="labelMedium">Address:</Text>
            <Text variant="bodyMedium" style={styles.contactValue}>
              {brokerage.contact_info.address}
            </Text>
          </View>
          
          {brokerage.contact_info.branches && brokerage.contact_info.branches.length > 0 && (
            <View style={styles.contactItem}>
              <Text variant="labelMedium">Branches:</Text>
              <View style={styles.branchesList}>
                {brokerage.contact_info.branches.map((branch, index) => (
                  <Text key={index} variant="bodyMedium" style={styles.branchItem}>
                    • {branch}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Category Ratings */}
      {ratings && ratings.category_ratings && (
        <Card style={styles.categoryCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>Category Ratings</Text>
            
            <View style={styles.categoryItem}>
              <Text variant="bodyMedium">Customer Service</Text>
              <View style={styles.categoryRating}>
                <ProgressBar 
                  progress={ratings.category_ratings.customer_service / 6} 
                  style={styles.categoryProgressBar}
                />
                <Text variant="bodySmall">{ratings.category_ratings.customer_service.toFixed(1)}/6</Text>
              </View>
            </View>
            
            <View style={styles.categoryItem}>
              <Text variant="bodyMedium">Trading Platform</Text>
              <View style={styles.categoryRating}>
                <ProgressBar 
                  progress={ratings.category_ratings.trading_platform / 6} 
                  style={styles.categoryProgressBar}
                />
                <Text variant="bodySmall">{ratings.category_ratings.trading_platform.toFixed(1)}/6</Text>
              </View>
            </View>
            
            <View style={styles.categoryItem}>
              <Text variant="bodyMedium">Fees</Text>
              <View style={styles.categoryRating}>
                <ProgressBar 
                  progress={ratings.category_ratings.fees / 6} 
                  style={styles.categoryProgressBar}
                />
                <Text variant="bodySmall">{ratings.category_ratings.fees.toFixed(1)}/6</Text>
              </View>
            </View>
            
            <View style={styles.categoryItem}>
              <Text variant="bodyMedium">Research Quality</Text>
              <View style={styles.categoryRating}>
                <ProgressBar 
                  progress={ratings.category_ratings.research_quality / 6} 
                  style={styles.categoryProgressBar}
                />
                <Text variant="bodySmall">{ratings.category_ratings.research_quality.toFixed(1)}/6</Text>
              </View>
            </View>
            
            <View style={styles.categoryItem}>
              <Text variant="bodyMedium">Reliability</Text>
              <View style={styles.categoryRating}>
                <ProgressBar 
                  progress={ratings.category_ratings.reliability / 6} 
                  style={styles.categoryProgressBar}
                />
                <Text variant="bodySmall">{ratings.category_ratings.reliability.toFixed(1)}/6</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={() => router.push(`/brokerage/${id}/rate`)}
          style={styles.actionButton}
          icon="star"
        >
          Rate & Review
        </Button>
        <Button
          mode="outlined"
          onPress={openWebsite}
          style={styles.actionButton}
          icon="open-in-new"
        >
          Visit Website
        </Button>
      </View>
    </ScrollView>
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
  website: {
    color: '#1976D2',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  ratingCard: {
    margin: 16,
    backgroundColor: '#E8F5E8',
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingScore: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  starRating: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  star: {
    fontSize: 20,
    marginRight: 2,
  },
  starFilled: {
    color: '#FFD700',
  },
  starEmpty: {
    color: '#E0E0E0',
  },
  ratingCount: {
    color: '#666',
  },
  ratingBreakdown: {
    flex: 1,
    marginLeft: 24,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 8,
    height: 8,
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 12,
    color: '#1976D2',
  },
  description: {
    marginBottom: 16,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  servicesCard: {
    margin: 16,
    marginTop: 8,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    marginBottom: 8,
  },
  specialtiesCard: {
    margin: 16,
    marginTop: 8,
  },
  specialtiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    marginBottom: 8,
    backgroundColor: '#E3F2FD',
  },
  platformsCard: {
    margin: 16,
    marginTop: 8,
  },
  platformsList: {
    gap: 4,
  },
  platformItem: {
    marginBottom: 4,
  },
  researchCard: {
    margin: 16,
    marginTop: 8,
  },
  researchList: {
    gap: 4,
  },
  researchItem: {
    marginBottom: 4,
  },
  contactCard: {
    margin: 16,
    marginTop: 8,
  },
  contactItem: {
    marginBottom: 12,
  },
  contactValue: {
    marginTop: 4,
    color: '#666',
  },
  branchesList: {
    marginTop: 4,
  },
  branchItem: {
    marginBottom: 2,
    color: '#666',
  },
  categoryCard: {
    margin: 16,
    marginTop: 8,
  },
  categoryItem: {
    marginBottom: 12,
  },
  categoryRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryProgressBar: {
    flex: 1,
    marginRight: 8,
    height: 6,
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});
