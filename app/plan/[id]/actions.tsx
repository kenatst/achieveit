import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CalendarPlus, FileDown, Trash2, Share2 } from "lucide-react-native";
import { MotiView } from "moti";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlans } from "@/contexts/PlansContext";
import { exportPlanToCalendar } from "@/utils/calendarExport";
import { exportPlanToPDF } from "@/utils/pdfExport";
import { triggerLight, triggerWarning } from "@/utils/haptics";

export default function ActionsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, shadows } = useTheme();
    const { t } = useLanguage();
    const { plans, deletePlan } = usePlans();
    const [exporting, setExporting] = useState<string | null>(null);

    const plan = plans.find((p) => p.id === id);

    if (!plan) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.notFound}>
                        <Text style={[styles.notFoundText, { color: colors.ink }]}>Plan not found</Text>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    const handleExportCalendar = async () => {
        triggerLight();
        setExporting("calendar");
        try {
            await exportPlanToCalendar(plan);
        } catch (error) {
            Alert.alert("Error", "Failed to export to calendar");
        } finally {
            setExporting(null);
        }
    };

    const handleExportPDF = async () => {
        triggerLight();
        setExporting("pdf");
        try {
            await exportPlanToPDF(plan);
        } catch (error) {
            Alert.alert("Error", "Failed to export PDF");
        } finally {
            setExporting(null);
        }
    };

    const handleDelete = () => {
        triggerWarning();
        Alert.alert(
            t("plans.deletePlan"),
            t("plans.deleteConfirm"),
            [
                { text: t("common.cancel"), style: "cancel" },
                {
                    text: t("common.delete"),
                    style: "destructive",
                    onPress: () => {
                        deletePlan(plan.id);
                        router.replace("/(tabs)/plans" as any);
                    },
                },
            ]
        );
    };

    const actions = [
        {
            id: "calendar",
            icon: <CalendarPlus color={colors.rust} size={24} />,
            label: t("planDetail.exportCalendar"),
            sublabel: "Add tasks to your calendar app",
            color: colors.rust,
            bgColor: colors.rustSoft,
            onPress: handleExportCalendar,
        },
        {
            id: "pdf",
            icon: <FileDown color={colors.sage} size={24} />,
            label: t("planDetail.downloadPDF"),
            sublabel: "Generate a printable roadmap",
            color: colors.sage,
            bgColor: colors.sageSoft,
            onPress: handleExportPDF,
        },
        {
            id: "share",
            icon: <Share2 color={colors.ink} size={24} />,
            label: "Share Plan",
            sublabel: "Send to a friend or mentor",
            color: colors.ink,
            bgColor: colors.divider,
            onPress: handleExportPDF, // Uses PDF sharing
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <ArrowLeft color={colors.ink} size={22} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: colors.ink }]}>Actions</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Plan Info */}
                    <MotiView
                        from={{ opacity: 0, translateY: -10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        style={styles.planInfo}
                    >
                        <Text style={[styles.planTitle, { color: colors.ink }]}>{plan.content.title}</Text>
                        <Text style={[styles.planProgress, { color: colors.inkMedium }]}>
                            {plan.progress.overallProgress}% complete
                        </Text>
                    </MotiView>

                    {/* Actions Grid */}
                    {actions.map((action, i) => (
                        <MotiView
                            key={action.id}
                            from={{ opacity: 0, translateX: -20 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ delay: i * 80 }}
                        >
                            <Pressable
                                style={[
                                    styles.actionCard,
                                    { backgroundColor: colors.surface },
                                    shadows.card,
                                    exporting === action.id && { opacity: 0.6 },
                                ]}
                                onPress={action.onPress}
                                disabled={exporting !== null}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: action.bgColor }]}>
                                    {action.icon}
                                </View>
                                <View style={styles.actionContent}>
                                    <Text style={[styles.actionLabel, { color: colors.ink }]}>{action.label}</Text>
                                    <Text style={[styles.actionSublabel, { color: colors.inkMuted }]}>
                                        {action.sublabel}
                                    </Text>
                                </View>
                            </Pressable>
                        </MotiView>
                    ))}

                    {/* Danger Zone */}
                    <View style={styles.dangerZone}>
                        <Text style={[styles.dangerLabel, { color: colors.inkFaint }]}>DANGER ZONE</Text>
                        <Pressable
                            style={[styles.deleteBtn, { borderColor: colors.negative }]}
                            onPress={handleDelete}
                        >
                            <Trash2 color={colors.negative} size={20} />
                            <Text style={[styles.deleteBtnText, { color: colors.negative }]}>
                                {t("plans.deletePlan")}
                            </Text>
                        </Pressable>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
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
    headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "600" },
    scroll: { paddingHorizontal: 24, paddingTop: 24 },
    // Plan Info
    planInfo: { marginBottom: 28 },
    planTitle: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
    planProgress: { fontSize: 14 },
    // Action Card
    actionCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 18,
        borderRadius: 16,
        marginBottom: 12,
        gap: 16,
    },
    actionIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    actionContent: { flex: 1 },
    actionLabel: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
    actionSublabel: { fontSize: 13 },
    // Danger Zone
    dangerZone: { marginTop: 32 },
    dangerLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 12 },
    deleteBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 10,
    },
    deleteBtnText: { fontSize: 15, fontWeight: "600" },
    notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
    notFoundText: { fontSize: 16 },
});
