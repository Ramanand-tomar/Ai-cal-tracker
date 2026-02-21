import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { fetchAdminNotificationMessages } from "../services/adminConfig";

// Configure how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const requestNotificationPermissions = async () => {
    if (!Device.isDevice) {
        console.warn("Must use physical device for Push Notifications");
        return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        return false;
    }

    if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }

    return true;
};

export const scheduleReminders = async (isSubscribed: boolean) => {
    // Clear existing notifications first to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    const messages = await fetchAdminNotificationMessages();

    // 1. Engagement Notification (Daily at 10:00 AM) - Only if NOT subscribed
    if (!isSubscribed) {
        await scheduleDailyNotification(
            "Reach Your Goals 🚀",
            messages.engagementMessage,
            10, 0
        );
    }

    // 2. Lunch Reminder (1:00 PM) - 13:00
    await scheduleDailyNotification(
        "Lunch Reminder 🥗",
        messages.lunchReminder,
        13, 0
    );

    // 3. Afternoon Reminder (4:00 PM) - 16:00
    await scheduleDailyNotification(
        "Afternoon Check-in 💧",
        messages.afternoonReminder,
        16, 0
    );

    // 4. Dinner Reminder (8:00 PM) - 20:00
    await scheduleDailyNotification(
        "Dinner Time 🍽️",
        messages.dinnerReminder,
        20, 0
    );
};

const scheduleDailyNotification = async (title: string, body: string, hour: number, minute: number) => {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: {
                type: 'calendar',
                hour,
                minute,
                repeats: true,
            } as any,
        });
    } catch (error) {
        console.error(`Error scheduling notification at ${hour}:${minute}:`, error);
    }
};

export const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};
