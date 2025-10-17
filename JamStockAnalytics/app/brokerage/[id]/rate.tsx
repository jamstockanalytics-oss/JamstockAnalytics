import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button, TextInput, ActivityIndicator } from "react-native-paper";
import { getBrokerageById, type BrokerageCompany } from "../../../lib/services/brokerage-service";
import { submitRating, getUserRating, type RatingSubmission } from "../../../lib/services/rating-service";
import { useAuth } from "../../../contexts/AuthContext";
import { SimpleLogo } from "../../../components/SimpleLogo";

export default function RateBrokerageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  
  const [brokerage, setBrokerage] = useState<BrokerageCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Rating state
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({
    customer_service: 0,
    trading_platform: 0,
    fees: 0,
    research_quality: 0,
    reliability: 0
  });
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    loadBrokerageData();
  }, [id]);

  const loadBrokerageData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const brokerageData = await getBrokerageById(id);
      setBrokerage(brokerageData);
      
      // Load existing rating if user has already rated
      if (session?.user?.id) {
        const existingRating = await getUserRating(id, session.user.id);
        if (existingRating) {
          setOverallRating(existingRating.rating);
          setCategoryRatings(existingRating.categories);
          setReviewText(existingRating.review_text || "");
        }
      }
    } catch (error) {
      console.error('Failed to load brokerage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!session?.user?.id || !id || overallRating === 0) {
      return;
    }

    try {
      setSubmitting(true);
      
      const ratingSubmission: RatingSubmission = {
        brokerage_id: id,
        user_id: session.user.id,
        rating: overallRating,
        review_text: reviewText.trim() || '',
        categories: categoryRatings
      };

      const result = await submitRating(ratingSubmission);
      
      if (result.success) {
        router.back();
      } else {
        console.error('Failed to submit rating:', result.error);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStarRating = (rating: number, onPress: (rating: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 6; i++) {
      stars.push(
        <Text 
          key={i} 
          style={[styles.star, i <= rating ? styles.starFilled : styles.starEmpty]}
          onPress={() => onPress(i)}
        >
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

  if (!session?.user?.id) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge">Please sign in to rate this brokerage.</Text>
        <Button mode="contained" onPress={() => router.push('/(auth)/login')} style={{ marginTop: 16 }}>
          Sign In
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <SimpleLogo size="medium" showText={false} />
        <Text variant="headlineMedium">Rate & Review</Text>
        <Text variant="titleMedium">{brokerage.name}</Text>
      </View>

      {/* Overall Rating */}
      <Card style={styles.ratingCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Overall Rating</Text>
          <Text variant="bodyMedium" style={styles.ratingDescription}>
            How would you rate your overall experience with {brokerage.name}?
          </Text>
          <View style={styles.starRating}>
            {getStarRating(overallRating, setOverallRating)}
          </View>
          <Text variant="bodySmall" style={styles.ratingText}>
            {overallRating > 0 ? `${overallRating} out of 6 stars` : 'Tap a star to rate'}
          </Text>
        </Card.Content>
      </Card>

      {/* Category Ratings */}
      <Card style={styles.categoriesCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Category Ratings</Text>
          <Text variant="bodyMedium" style={styles.categoriesDescription}>
            Rate specific aspects of the brokerage service
          </Text>
          
          <View style={styles.categoryItem}>
            <Text variant="bodyLarge">Customer Service</Text>
            <View style={styles.starRating}>
              {getStarRating(categoryRatings.customer_service, (rating) => 
                setCategoryRatings(prev => ({ ...prev, customer_service: rating }))
              )}
            </View>
          </View>
          
          <View style={styles.categoryItem}>
            <Text variant="bodyLarge">Trading Platform</Text>
            <View style={styles.starRating}>
              {getStarRating(categoryRatings.trading_platform, (rating) => 
                setCategoryRatings(prev => ({ ...prev, trading_platform: rating }))
              )}
            </View>
          </View>
          
          <View style={styles.categoryItem}>
            <Text variant="bodyLarge">Fees & Commissions</Text>
            <View style={styles.starRating}>
              {getStarRating(categoryRatings.fees, (rating) => 
                setCategoryRatings(prev => ({ ...prev, fees: rating }))
              )}
            </View>
          </View>
          
          <View style={styles.categoryItem}>
            <Text variant="bodyLarge">Research Quality</Text>
            <View style={styles.starRating}>
              {getStarRating(categoryRatings.research_quality, (rating) => 
                setCategoryRatings(prev => ({ ...prev, research_quality: rating }))
              )}
            </View>
          </View>
          
          <View style={styles.categoryItem}>
            <Text variant="bodyLarge">Reliability</Text>
            <View style={styles.starRating}>
              {getStarRating(categoryRatings.reliability, (rating) => 
                setCategoryRatings(prev => ({ ...prev, reliability: rating }))
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Written Review */}
      <Card style={styles.reviewCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Written Review</Text>
          <Text variant="bodyMedium" style={styles.reviewDescription}>
            Share your detailed experience with {brokerage.name} (optional)
          </Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={6}
            placeholder="Tell us about your experience with this brokerage. What did you like? What could be improved?"
            value={reviewText}
            onChangeText={setReviewText}
            style={styles.reviewInput}
          />
        </Card.Content>
      </Card>

      {/* Rating Guidelines */}
      <Card style={styles.guidelinesCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Rating Guidelines</Text>
          <View style={styles.guidelinesList}>
            <Text variant="bodyMedium">• 6 stars: Exceptional service, exceeds expectations</Text>
            <Text variant="bodyMedium">• 5 stars: Very good service, meets high standards</Text>
            <Text variant="bodyMedium">• 4 stars: Good service, meets expectations</Text>
            <Text variant="bodyMedium">• 3 stars: Average service, room for improvement</Text>
            <Text variant="bodyMedium">• 2 stars: Below average service, significant issues</Text>
            <Text variant="bodyMedium">• 1 star: Poor service, major problems</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleSubmitRating}
          loading={submitting}
          disabled={overallRating === 0 || submitting}
          style={styles.submitButton}
          icon="star"
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.cancelButton}
        >
          Cancel
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
  ratingCard: {
    margin: 16,
    backgroundColor: '#E8F5E8',
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#2E7D32',
  },
  ratingDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  starRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  star: {
    fontSize: 32,
    marginHorizontal: 4,
    color: '#E0E0E0',
  },
  starFilled: {
    color: '#FFD700',
  },
  starEmpty: {
    color: '#E0E0E0',
  },
  ratingText: {
    textAlign: 'center',
    color: '#666',
  },
  categoriesCard: {
    margin: 16,
    marginTop: 8,
  },
  categoriesDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  categoryItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  reviewCard: {
    margin: 16,
    marginTop: 8,
  },
  reviewDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  reviewInput: {
    minHeight: 120,
  },
  guidelinesCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#F0F8FF',
  },
  guidelinesList: {
    gap: 8,
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    gap: 12,
  },
  submitButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
});
