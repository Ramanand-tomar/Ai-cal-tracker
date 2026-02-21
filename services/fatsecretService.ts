import CryptoJS from "crypto-js";

const CONSUMER_KEY = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_ID;
const CONSUMER_SECRET = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_SECRET;
const API_BASE_URL = "https://platform.fatsecret.com/rest/server.api";

interface FoodSearchResponse {
    foods?: {
        food?: any[];
        max_results: string;
        page_number: string;
        total_results: string;
    };
}

class FatSecretService {
    private rfc3986Encode(str: string): string {
        return encodeURIComponent(str)
            .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
    }

    private generateSignature(method: string, url: string, params: Record<string, string>): string {
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${this.rfc3986Encode(key)}=${this.rfc3986Encode(params[key])}`)
            .join('&');

        const baseString = `${method.toUpperCase()}&${this.rfc3986Encode(url)}&${this.rfc3986Encode(sortedParams)}`;
        const signingKey = `${this.rfc3986Encode(CONSUMER_SECRET || "")}&`;

        const signature = CryptoJS.HmacSHA1(baseString, signingKey);
        return CryptoJS.enc.Base64.stringify(signature);
    }

    async searchFoods(query: string): Promise<any[]> {
        if (!query || query.trim().length === 0 || !CONSUMER_KEY) return [];

        try {
            const oauthParams: Record<string, string> = {
                method: "foods.search",
                search_expression: query,
                format: "json",
                max_results: "20",
                oauth_consumer_key: CONSUMER_KEY,
                oauth_signature_method: "HMAC-SHA1",
                oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
                oauth_nonce: Math.random().toString(36).substring(2),
                oauth_version: "1.0",
            };

            const signature = this.generateSignature("GET", API_BASE_URL, oauthParams);
            oauthParams.oauth_signature = signature;

            const queryString = Object.keys(oauthParams)
                .map(key => `${this.rfc3986Encode(key)}=${this.rfc3986Encode(oauthParams[key])}`)
                .join('&');

            const response = await fetch(`${API_BASE_URL}?${queryString}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`FatSecret Search Error: ${response.status} - ${errorText}`);
            }

            const data: FoodSearchResponse = await response.json();

            if (!data.foods || !data.foods.food) {
                return [];
            }

            const foodArray = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];

            return foodArray.map((food: any) => {
                const desc = food.food_description || "";
                const caloriesMatch = desc.match(/Calories: (\d+)kcal/);
                const fatMatch = desc.match(/Fat: ([\d.]+)g/);
                const carbsMatch = desc.match(/Carbs: ([\d.]+)g/);
                const proteinMatch = desc.match(/Protein: ([\d.]+)g/);
                const unitMatch = desc.split(" - ")[0];

                return {
                    id: food.food_id,
                    name: food.food_name,
                    brand: food.brand_name || (food.food_type === "Brand" ? "Generic" : "Generic"),
                    calories: caloriesMatch ? parseInt(caloriesMatch[1]) : 0,
                    unit: unitMatch || "serving",
                    protein: proteinMatch ? parseFloat(proteinMatch[1]) : 0,
                    carbs: carbsMatch ? parseFloat(carbsMatch[1]) : 0,
                    fats: fatMatch ? parseFloat(fatMatch[1]) : 0,
                };
            });
        } catch (error) {
            console.error("FatSecret Search Failed:", error);
            return [];
        }
    }
}

export const fatsecretService = new FatSecretService();

