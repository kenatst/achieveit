import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CalendarPlus, FileDown, Share2, Check, Loader2 } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";
import { lightTap, successNotification } from "@/utils/haptics";
import { exportPlanToCalendar } from "@/utils/calendarExport";
import { exportPlanToPDF } from "@/utils/pdfExport";

export default function ExportScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, shadows } = useTheme();
    const { t } = useLanguage();
    const { plans } = usePlans();

    const [exportingCalendar, setExportingCalendar] = useState(false);
    const [exportingPDF, setExportingPDF] = useState(false);
    const [calendarDone, setCalendarDone] = useState(false);
    const [pdfDone, setPdfDone] = useState(false);

    const plan = plans.find(p => p.id === id);

    if (!plan) return null;

    const handleExportCalendar = async () => {
        lightTap();
        setExportingCalendar(true);
        try {
            const success = await exportPlanToCalendar(plan);
            if (success) {
                successNotification();
                setCalendarDone(true);
                setTimeout(() => setCalendarDone(false), 3000);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to export to calendar");
        } finally {
            setExportingCalendar(false);
        }
    };

    const handleExportPDF = async () => {
        lightTap();
        setExportingPDF(true);
        try {
            const success = await exportPlanToPDF(plan);
            if (success) {
                successNotification();
                setPdfDone(true);
                setTimeout(() => setPdfDone(false), 3000);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to export PDF");
        } finally {
            setExportingPDF(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                    <Pressable style={styles.backBtn} onPress={() => { lightTap(); router.back(); }}>
                        <ArrowLeft color={colors.ink} size={22} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: colors.ink }]}>
                        Export
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.content}>
                    {/* Plan Preview */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={[styles.previewCard, { backgroundColor: colors.surface }, shadows.card]}
                    >
                        <Text style={[styles.previewTitle, { color: colors.ink }]} numberOfLines={2}>
                            {plan.content.title}
                        </Text>
                        <Text style={[styles.previewStats, { color: colors.inkMuted }]}>
                            {plan.content.weeklyPlans.length} weeks • {plan.content.routines.length} routines • {plan.progress.overallProgress}% complete
                        </Text>
                    </MotiView>

                    {/* Export Options */}
                    <Text style={[styles.sectionLabel, { color: colors.inkMuted }]}>
                        EXPORT OPTIONS
                    </Text>

                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 100 }}
                    >
                        <Pressable
                            style={[
                                styles.exportBtn,
                                { backgroundColor: colors.surface },
                                shadows.card,
                                calendarDone && { borderWidth: 2, borderColor: colors.sage },
                            ]}
                            onPress={handleExportCalendar}
                            disabled={exportingCalendar}
                        >
                            <View style={[styles.exportIcon, { backgroundColor: colors.rustSoft }]}>
                                {exportingCalendar ? (
                                    <MotiView
                                        from={{ rotate: "0deg" }}
                                        animate={{ rotate: "360deg" }}
                                        transition={{ type: "timing", duration: 1000, loop: true }}
                                    >
                                        <Loader2 color={colors.rust} size={22} />
                                    </MotiView>
                                ) : calendarDone ? (
                                    <Check color={colors.sage} size={22} strokeWidth={3} />
                                ) : (
                                    <CalendarPlus color={colors.rust} size={22} />
                                )}
                            </View>
                            <View style={styles.exportInfo}>
                                <Text style={[styles.exportLabel, { color: colors.ink }]}>
                                    {t("planDetail.exportCalendar")}
                                </Text>
                                <Text style={[styles.exportDesc, { color: colors.inkMuted }]}>
                                    Add weekly tasks to your calendar app
                                </Text>
                            </View>
                        </Pressable>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 150 }}
                    >
                        <Pressable
                            style={[
                                styles.exportBtn,
                                { backgroundColor: colors.surface },
                                shadows.card,
                                pdfDone && { borderWidth: 2, borderColor: colors.sage },
                            ]}
                            onPress={handleExportPDF}
                            disabled={exportingPDF}
                        >
                            <View style={[styles.exportIcon, { backgroundColor: colors.sageSoft }]}>
                                {exportingPDF ? (
                                    <MotiView
                                        from={{ rotate: "0deg" }}
                                        animate={{ rotate: "360deg" }}
                                        transition={{ type: "timing", duration: 1000, loop: true }}
                                    >
                                        <Loader2 color={colors.sage} size={22} />
                                    </MotiView>
                                ) : pdfDone ? (
                                    <Check color={colors.sage} size={22} strokeWidth={3} />
                                ) : (
                                    <FileDown color={colors.sage} size={22} />
                                )}
                            </View>
                            <View style={styles.exportInfo}>
                                <Text style={[styles.exportLabel, { color: colors.ink }]}>
                                    {t("planDetail.downloadPDF")}
                                </Text>
                                <Text style={[styles.exportDesc, { color: colors.inkMuted }]}>
                                    Beautiful PDF with all plan details
                                </Text>
                            </View>
                        </Pressable>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 200 }}
                    >
                        <Pressable
                            style={[styles.exportBtn, { backgroundColor: colors.surface }, shadows.card]}
                            onPress={() => {
                                lightTap();
                                Alert.alert("Coming Soon", "Share functionality will be available in a future update!");
                            }}
                        >
                            <View style={[styles.exportIcon, { backgroundColor: "#EEF2FF" }]}>
                                <Share2 color="#6366F1" size={22} />
                            </View>
                            <View style={styles.exportInfo}>
                                <Text style={[styles.exportLabel, { color: colors.ink }]}>
                                    Share Plan
                                </Text>
                                <Text style={[styles.exportDesc, { color: colors.inkMuted }]}>
                                    Send to friends or accountability partner
                                </Text>
                            </View>
                        </Pressable>
                    </MotiView>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
    },
    backBtn: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: "600",
        textAlign: "center",
    },
    content: {
        padding: 24,
    },
    previewCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 32,
        alignItems: "center",
    },
    previewTitle: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
    },
    previewStats: {
        fontSize: 14,
        textAlign: "center",
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.5,
        marginBottom: 16,
    },
    exportBtn: {
        flexDirection: "row",
        alignItems: "center",
        padding: 18,
        borderRadius: 16,
        marginBottom: 12,
        gap: 16,
    },
    exportIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    exportInfo: {
        flex: 1,
    },
    exportLabel: {
        fontSize: 17,
        fontWeight: "600",
        marginBottom: 4,
    },
    exportDesc: {
        fontSize: 14,
    },
});
