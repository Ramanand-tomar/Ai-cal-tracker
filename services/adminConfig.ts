import { db } from "@/config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export interface NotificationMessages {
    lunchReminder: string;
    afternoonReminder: string;
    dinnerReminder: string;
    engagementMessage: string;
}

const DEFAULT_MESSAGES: NotificationMessages = {
    lunchReminder: "Time for lunch! Don't forget to log your meal to stay on track. 🥗",
    afternoonReminder: "A quick afternoon check-in! How's your water intake and snacks going? 💧",
    dinnerReminder: "Hope you had a great day! Log your dinner to complete your daily goal. 🍽️",
    engagementMessage: "Consistency is key! Log an activity today to reach your health goals faster. 🚀"
};

export const fetchAdminNotificationMessages = async (): Promise<NotificationMessages> => {
    try {
        const adminRef = doc(db, "Admin", "notifications");
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
            const data = adminSnap.data();
            return {
                lunchReminder: data.lunchReminder || DEFAULT_MESSAGES.lunchReminder,
                afternoonReminder: data.afternoonReminder || DEFAULT_MESSAGES.afternoonReminder,
                dinnerReminder: data.dinnerReminder || DEFAULT_MESSAGES.dinnerReminder,
                engagementMessage: data.engagementMessage || DEFAULT_MESSAGES.engagementMessage
            };
        } else {
            // Seed defaults if doc doesn't exist
            await initializeAdminSettings();
            return DEFAULT_MESSAGES;
        }
    } catch (error) {
        console.error("Error fetching admin notification messages:", error);
        return DEFAULT_MESSAGES;
    }
};

export const initializeAdminSettings = async () => {
    try {
        const adminRef = doc(db, "Admin", "notifications");
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
            const { setDoc } = await import("firebase/firestore");
            await setDoc(adminRef, DEFAULT_MESSAGES);
            console.log("Admin notification settings initialized with defaults.");
        }
    } catch (error) {
        console.error("Error initializing admin settings:", error);
    }
};
