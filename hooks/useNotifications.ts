import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

export const useNotifications = () => {
    const router = useRouter();
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);

    useEffect(() => {
        // Foreground Listener: What happens when a notification arrives while the app is open
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            // You could show an in-app banner or toast here if needed
            console.log("Notification received in foreground:", notification);
        });

        // Response Listener: What happens when a user TAPS on a notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log("Notification tapped:", response);

            // Redirect user to the home page or specific log page
            // For now, redirect to the main home screen
            router.push("/");
        });

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);
};
