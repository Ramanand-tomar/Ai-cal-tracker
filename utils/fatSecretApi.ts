import { generateOAuth1Header } from './oauth1';

const CLIENT_ID = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_SECRET;

const API_URL = 'https://platform.fatsecret.com/rest/server.api';

/**
 * Searches for food items using the FatSecret API with OAuth 1.0a
 * @param query Search term
 * @returns List of food items
 */
export const searchFood = async (query: string) => {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error("FatSecret Credentials missing in .env");
        return [];
    }

    try {
        const params: Record<string, string> = {
            method: 'foods.search',
            search_expression: query,
            format: 'json',
            max_results: '10'
        };

        const oauthParams = generateOAuth1Header(
            'GET',
            API_URL,
            params,
            CLIENT_ID,
            CLIENT_SECRET
        );

        const queryParams = new URLSearchParams(oauthParams).toString();
        const response = await fetch(`${API_URL}?${queryParams}`, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Search API failed:', response.status, errorText);
            return [];
        }

        const data = await response.json();

        if (data.foods && data.foods.food) {
            const foods = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];
            return foods;
        }

        return [];

    } catch (error) {
        console.error('Error searching food:', error);
        return [];
    }
};

/**
 * Gets detailed information for a specific food item
 * @param foodId FatSecret Food ID
 * @returns Food details
 */
export const getFoodDetails = async (foodId: string) => {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error("FatSecret Credentials missing in .env");
        return null;
    }

    try {
        const params: Record<string, string> = {
            method: 'food.get.v2',
            food_id: foodId,
            format: 'json'
        };

        const oauthParams = generateOAuth1Header(
            'GET',
            API_URL,
            params,
            CLIENT_ID,
            CLIENT_SECRET
        );

        const queryParams = new URLSearchParams(oauthParams).toString();
        const response = await fetch(`${API_URL}?${queryParams}`, {
            method: 'GET',
        });

        if (!response.ok) {
            console.error('Food Details API failed:', response.status);
            return null;
        }

        const data = await response.json();
        return data.food || null;

    } catch (error) {
        console.error('Error getting food details:', error);
        return null;
    }
};
