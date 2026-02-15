/**
 * Calorie Calculation Utilities
 * Based on Metabolic Equivalent of Task (MET) standard values.
 */

// MET values for supported activities
export const METS = {
    Run: {
        Low: 7.0,    // Jogging, ~5 mph
        Medium: 9.8, // Running, ~6 mph
        High: 12.0,  // Running, ~8-9 mph
    },
    'Weight Lifting': {
        Low: 3.5,    // Light effort
        Medium: 5.0, // Moderate effort
        High: 6.0,   // Vigorous effort
    },
    Gym: { // Fallback for general gym
        Low: 3.5,
        Medium: 5.0,
        High: 6.0
    },
    Yoga: {
        Low: 2.0,
        Medium: 3.0,
        High: 4.0
    }
};

// Default user stats if profile is empty
const DEFAULT_STATS = {
    weight: 70, // kg
    height: 170, // cm
    age: 30,
    gender: 'male',
};

interface UserStats {
    weight?: number; // in kg
    gender?: string;
    age?: number;
}

/**
 * Calculate calories burned
 * Formula: Calories = MET * Weight(kg) * Duration(hours)
 * 
 * @param type - Exercise type (Run, Weight Lifting, etc)
 * @param intensity - Low, Medium, High
 * @param durationMinutes - Duration in minutes
 * @param userStats - User profile data
 */
export const calculateCalories = (
    type: string,
    intensity: 'Low' | 'Medium' | 'High',
    durationMinutes: number,
    userStats?: UserStats
): number => {
    // 1. Get MET value
    let activityMets = METS[type as keyof typeof METS] || METS['Gym'];
    let met = activityMets[intensity] || activityMets['Medium'];

    // 2. Get Weight (default to 70kg if missing)
    const weight = userStats?.weight || DEFAULT_STATS.weight;

    // 3. Calculate
    // Calories = MET * Weight(kg) * (Minutes / 60)
    const durationHours = durationMinutes / 60;
    const calories = met * weight * durationHours;

    return Math.round(calories);
};
