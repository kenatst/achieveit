import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Plan } from "@/types/plan";

interface DiagnosisSectionProps {
    plan: Plan;
}

export default function DiagnosisSection({ plan }: DiagnosisSectionProps) {
    const { colors } = useTheme();

    return (
        <View style={styles.sectionBody}>
            <View style={styles.block}>
                <Text style={[styles.blockLabel, { color: colors.inkFaint }]}>Current state</Text>
                <Text style={[styles.blockText, { color: colors.ink }]}>
                    {plan.content.diagnosis.currentState}
                </Text>
            </View>
            <View style={styles.block}>
                <Text style={[styles.blockLabel, { color: colors.inkFaint }]}>Gap</Text>
                <Text style={[styles.blockText, { color: colors.ink }]}>
                    {plan.content.diagnosis.gap}
                </Text>
            </View>
            <View style={styles.block}>
                <Text style={[styles.blockLabel, { color: colors.inkFaint }]}>Success factors</Text>
                {plan.content.diagnosis.successFactors.map((f, i) => (
                    <View key={i} style={styles.bulletRow}>
                        <View style={[styles.bullet, { backgroundColor: colors.rust }]} />
                        <Text style={[styles.bulletText, { color: colors.ink }]}>{f}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionBody: { marginTop: 12, gap: 12 },
    block: { marginBottom: 14 },
    blockLabel: {
        fontSize: 11,
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    blockText: { fontSize: 15, lineHeight: 22 },
    bulletRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 6 },
    bullet: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginRight: 12,
        marginTop: 9,
    },
    bulletText: { flex: 1, fontSize: 15, lineHeight: 22 },
});
