import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Analytics')
export class Analytics extends Component {
    private static lastChallengeEventTime: number = 0;
    private static readonly CHALLENGE_EVENT_INTERVAL_MS: number = 50;
    private static pendingChallengeEvents: Array<{ eventName: string, scheduledTime: number }> = [];
    private static isProcessingPending: boolean = false;
    private static lastSentChallengeEventTime: number = 0;

    public static trackAnalyticsEvent(eventName: string): void {
        console.log("[Analytics] " + eventName);

        if (eventName.startsWith("CHALLENGE_")) {
            const currentTime = Date.now();
            const timeSinceLastEvent = currentTime - Analytics.lastChallengeEventTime;

            if (timeSinceLastEvent < Analytics.CHALLENGE_EVENT_INTERVAL_MS) {
                const scheduledTime = Analytics.lastChallengeEventTime + Analytics.CHALLENGE_EVENT_INTERVAL_MS;
                const delayMs = scheduledTime - currentTime;

                //console.log(`[Analytics] CHALLENGE event delayed: ${eventName}. Time since last CHALLENGE: ${timeSinceLastEvent}ms, will be sent in ${delayMs}ms`);

                Analytics.pendingChallengeEvents.push({
                    eventName: eventName,
                    scheduledTime: scheduledTime
                });

                if (!Analytics.isProcessingPending) {
                    Analytics.processPendingEvents();
                }

                return;
            }

            //console.log(`[Analytics] Time since last CHALLENGE: ${timeSinceLastEvent}ms`);

            Analytics.lastChallengeEventTime = currentTime;
            Analytics.lastSentChallengeEventTime = currentTime;
        }

        Analytics.sendEvent(eventName);
    }

    private static sendEvent(eventName: string): void {
        const analytics = (window as any).ALPlayableAnalytics;
        if (typeof analytics !== 'undefined') {
            analytics.trackEvent(eventName);
        }
    }

    private static processPendingEvents(): void {
        if (Analytics.pendingChallengeEvents.length === 0) {
            Analytics.isProcessingPending = false;
            return;
        }

        Analytics.isProcessingPending = true;

        const now = Date.now();
        const nextEvent = Analytics.pendingChallengeEvents[0];
        const delay = Math.max(0, nextEvent.scheduledTime - now);

        setTimeout(() => {
            const event = Analytics.pendingChallengeEvents.shift();
            if (event) {
                const currentTime = Date.now();
                const timeSinceLastSent = currentTime - Analytics.lastSentChallengeEventTime;

                Analytics.lastChallengeEventTime = currentTime;
                Analytics.lastSentChallengeEventTime = currentTime;

                //console.log(`[Analytics] Sending delayed CHALLENGE event: ${event.eventName}. Time since last CHALLENGE: ${timeSinceLastSent}ms`);
                Analytics.sendEvent(event.eventName);
            }

            Analytics.processPendingEvents();
        }, delay);
    }
}