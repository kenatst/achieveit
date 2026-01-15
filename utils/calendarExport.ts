import * as Calendar from "expo-calendar";
import { Platform, Alert } from "react-native";
import { Plan } from "@/types/plan";

/**
 * Get or create the AchieveIt calendar
 */
async function getOrCreateCalendar(): Promise<string | null> {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

    // Look for existing AchieveIt calendar
    const achieveItCalendar = calendars.find(
        (cal) => cal.title === "AchieveIt" && cal.allowsModifications
    );

    if (achieveItCalendar) {
        return achieveItCalendar.id;
    }

    // Create new calendar
    const defaultCalendarSource =
        Platform.OS === "ios"
            ? calendars.find((cal) => cal.source?.name === "iCloud")?.source ||
            calendars.find((cal) => cal.source?.name === "Default")?.source
            : { isLocalAccount: true, name: "AchieveIt", type: Calendar.SourceType.LOCAL };

    if (!defaultCalendarSource) {
        return null;
    }

    const newCalendarId = await Calendar.createCalendarAsync({
        title: "AchieveIt",
        color: "#D94528",
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: (defaultCalendarSource as { id?: string }).id,
        source: defaultCalendarSource as Calendar.Source,
        name: "AchieveIt",
        ownerAccount: "personal",
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });

    return newCalendarId;
}

/**
 * Calculate date from plan start date + week offset
 */
function getDateForWeek(startDate: string, weekNumber: number): Date {
    const start = new Date(startDate);
    const daysToAdd = (weekNumber - 1) * 7;
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + daysToAdd);
    return targetDate;
}

/**
 * Export plan milestones to device calendar
 */
export async function exportPlanToCalendar(plan: Plan): Promise<boolean> {
    try {
        // Request permissions
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission Required",
                "Calendar access is needed to export your plan milestones."
            );
            return false;
        }

        const calendarId = await getOrCreateCalendar();
        if (!calendarId) {
            Alert.alert("Error", "Could not create calendar. Please try again.");
            return false;
        }

        const startDate = plan.progress.startedAt || plan.createdAt;
        let eventsCreated = 0;

        // Export weekly milestones
        for (const week of plan.content.weeklyPlans) {
            const eventDate = getDateForWeek(startDate, week.week);
            const endDate = new Date(eventDate);
            endDate.setHours(eventDate.getHours() + 1);

            await Calendar.createEventAsync(calendarId, {
                title: `📍 ${plan.content.title} - Week ${week.week}`,
                notes: `Milestone: ${week.milestone}\n\nFocus: ${week.focus}\n\nTasks:\n${week.tasks.map((t) => `• ${t}`).join("\n")}`,
                startDate: eventDate,
                endDate: endDate,
                allDay: true,
                alarms: [{ relativeOffset: -1440 }], // 1 day before
            });
            eventsCreated++;
        }

        // Export checkpoint days (30, 60, 90)
        const checkpointDays = [30, 60, 90];
        const checkpointKeys = ["day30", "day60", "day90"] as const;

        for (let i = 0; i < checkpointDays.length; i++) {
            const day = checkpointDays[i];
            const key = checkpointKeys[i];
            const checkpointItems = plan.content.checkpoints[key];

            if (checkpointItems.length > 0) {
                const eventDate = new Date(startDate);
                eventDate.setDate(eventDate.getDate() + day);
                const endDate = new Date(eventDate);
                endDate.setHours(eventDate.getHours() + 1);

                await Calendar.createEventAsync(calendarId, {
                    title: `🎯 ${plan.content.title} - Day ${day} Checkpoint`,
                    notes: `Checkpoint items:\n${checkpointItems.map((item) => `• ${item}`).join("\n")}`,
                    startDate: eventDate,
                    endDate: endDate,
                    allDay: true,
                    alarms: [{ relativeOffset: -1440 }],
                });
                eventsCreated++;
            }
        }

        Alert.alert(
            "Success! 🎉",
            `${eventsCreated} events exported to your calendar.`,
            [{ text: "OK" }]
        );
        return true;
    } catch (error) {
        console.error("Calendar export error:", error);
        Alert.alert("Error", "Failed to export to calendar. Please try again.");
        return false;
    }
}

/**
 * Check if calendar export is available
 */
export async function isCalendarAvailable(): Promise<boolean> {
    try {
        const { status } = await Calendar.getCalendarPermissionsAsync();
        return status === "granted";
    } catch {
        return false;
    }
}
