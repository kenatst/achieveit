import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Plan } from "@/types/plan";
import { i18n } from "@/contexts/LanguageContext";

// Get translations for PDF
const getTranslations = () => ({
  phases: i18n.t("pdf.phases"),
  weeklyPlans: i18n.t("pdf.weeklyPlans"),
  dailyRoutines: i18n.t("pdf.dailyRoutines"),
  potentialObstacles: i18n.t("pdf.potentialObstacles"),
  checkpoints: i18n.t("pdf.checkpoints"),
  successMetrics: i18n.t("pdf.successMetrics"),
  generatedBy: i18n.t("pdf.generatedBy"),
  day30: i18n.locale === "fr" ? "Jour 30" : i18n.locale === "es" ? "Día 30" : i18n.locale === "de" ? "Tag 30" : i18n.locale === "it" ? "Giorno 30" : "Day 30",
  day60: i18n.locale === "fr" ? "Jour 60" : i18n.locale === "es" ? "Día 60" : i18n.locale === "de" ? "Tag 60" : i18n.locale === "it" ? "Giorno 60" : "Day 60",
  day90: i18n.locale === "fr" ? "Jour 90" : i18n.locale === "es" ? "Día 90" : i18n.locale === "de" ? "Tag 90" : i18n.locale === "it" ? "Giorno 90" : "Day 90",
});

// Generate beautiful HTML for PDF export
function generatePlanHTML(plan: Plan): string {
  const { content, progress } = plan;
  const t = getTranslations();

  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #121212;
        line-height: 1.6;
        padding: 40px;
        background: #FDFCF8;
      }
      .header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 30px;
        border-bottom: 2px solid #D94528;
      }
      h1 {
        font-size: 28px;
        font-weight: 700;
        color: #121212;
        margin-bottom: 10px;
      }
      .summary {
        font-size: 14px;
        color: #4A4A45;
        max-width: 600px;
        margin: 0 auto;
      }
      .progress-bar {
        width: 100%;
        height: 8px;
        background: #E6E2D8;
        border-radius: 4px;
        margin-top: 20px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: #D94528;
        border-radius: 4px;
      }
      .quote {
        font-style: italic;
        color: #4A4A45;
        padding: 20px;
        border-left: 3px solid #D94528;
        background: #F2EFE9;
        margin: 30px 0;
        border-radius: 0 8px 8px 0;
      }
      .section {
        margin-bottom: 30px;
      }
      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #D94528;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 1px solid #E6E2D8;
      }
      .phase {
        background: #F2EFE9;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 12px;
      }
      .phase-title {
        font-weight: 600;
        color: #121212;
        margin-bottom: 5px;
      }
      .phase-desc {
        font-size: 14px;
        color: #4A4A45;
      }
      .week {
        margin-bottom: 20px;
        page-break-inside: avoid;
      }
      .week-header {
        font-weight: 600;
        color: #121212;
        margin-bottom: 10px;
      }
      .task {
        display: flex;
        align-items: flex-start;
        margin-bottom: 6px;
        font-size: 14px;
      }
      .checkbox {
        width: 14px;
        height: 14px;
        border: 2px solid #D94528;
        border-radius: 3px;
        margin-right: 10px;
        flex-shrink: 0;
        margin-top: 3px;
      }
      .checkbox.done {
        background: #2A3B30;
        border-color: #2A3B30;
      }
      .routine {
        background: #E8EDE9;
        padding: 12px 15px;
        border-radius: 8px;
        margin-bottom: 10px;
        border-left: 3px solid #2A3B30;
      }
      .obstacle {
        background: #FFF5F3;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 12px;
        border-left: 3px solid #D94528;
      }
      .obstacle-title {
        font-weight: 500;
        color: #D94528;
        margin-bottom: 5px;
      }
      .obstacle-solution {
        font-size: 14px;
        color: #4A4A45;
      }
      .checkpoint {
        background: #F2EFE9;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 12px;
      }
      .checkpoint-day {
        font-size: 12px;
        color: #D94528;
        font-weight: 600;
        margin-bottom: 5px;
      }
      .metric {
        padding: 10px 0;
        border-bottom: 1px solid #E6E2D8;
        font-size: 14px;
      }
      .metric:last-child {
        border-bottom: none;
      }
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #E6E2D8;
        text-align: center;
        font-size: 12px;
        color: #8C8C84;
      }
    </style>
  `;

  const weekLabel = i18n.locale === "fr" ? "Semaine" : i18n.locale === "es" ? "Semana" : i18n.locale === "de" ? "Woche" : i18n.locale === "it" ? "Settimana" : "Week";

  const phasesHTML = content.phases.map((phase) => `
    <div class="phase">
      <div class="phase-title">${phase.name} (${phase.duration})</div>
      <div class="phase-desc">${phase.objective}</div>
    </div>
  `).join("");

  const weeklyPlansHTML = content.weeklyPlans.map((week, wi) => `
    <div class="week">
      <div class="week-header">${weekLabel} ${week.week}: ${week.focus}</div>
      ${week.tasks.map((task, ti) => `
        <div class="task">
          <div class="checkbox ${progress.weeklyTasks[wi]?.[ti] ? 'done' : ''}"></div>
          <span>${task}</span>
        </div>
      `).join("")}
    </div>
  `).join("");

  const routinesHTML = content.routines.map((routine) => `
    <div class="routine">
      <strong>${routine.name}</strong> – ${routine.frequency} • ${routine.duration}
    </div>
  `).join("");

  const obstaclesHTML = content.obstacles.map((obs) => `
    <div class="obstacle">
      <div class="obstacle-title">⚠️ ${obs.challenge}</div>
      <div class="obstacle-solution">💡 ${obs.solution}</div>
    </div>
  `).join("");

  const checkpointsHTML = `
    <div class="checkpoint">
      <div class="checkpoint-day">${t.day30}</div>
      ${content.checkpoints.day30.map(item => `<div>• ${item}</div>`).join("")}
    </div>
    <div class="checkpoint">
      <div class="checkpoint-day">${t.day60}</div>
      ${content.checkpoints.day60.map(item => `<div>• ${item}</div>`).join("")}
    </div>
    <div class="checkpoint">
      <div class="checkpoint-day">${t.day90}</div>
      ${content.checkpoints.day90.map(item => `<div>• ${item}</div>`).join("")}
    </div>
  `;

  const metricsHTML = content.successMetrics.map((metric) => `
    <div class="metric">✓ ${metric}</div>
  `).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      ${styles}
    </head>
    <body>
      <div class="header">
        <h1>${content.title}</h1>
        <p class="summary">${content.summary}</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress.overallProgress}%"></div>
        </div>
      </div>

      <div class="quote">"${content.motivationalQuote}"</div>

      <div class="section">
        <h2 class="section-title">${t.phases}</h2>
        ${phasesHTML}
      </div>

      <div class="section">
        <h2 class="section-title">${t.weeklyPlans}</h2>
        ${weeklyPlansHTML}
      </div>

      <div class="section">
        <h2 class="section-title">${t.dailyRoutines}</h2>
        ${routinesHTML}
      </div>

      <div class="section">
        <h2 class="section-title">${t.potentialObstacles}</h2>
        ${obstaclesHTML}
      </div>

      <div class="section">
        <h2 class="section-title">${t.checkpoints}</h2>
        ${checkpointsHTML}
      </div>

      <div class="section">
        <h2 class="section-title">${t.successMetrics}</h2>
        ${metricsHTML}
      </div>

      <div class="footer">
        ${t.generatedBy} • ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `;
}

// Export plan as PDF
export async function exportPlanToPDF(plan: Plan): Promise<boolean> {
  try {
    const html = generatePlanHTML(plan);

    const { uri } = await Print.printToFileAsync({
      html,
      margins: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `${plan.content.title} - AchieveIt Plan`,
        UTI: "com.adobe.pdf",
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("PDF export error:", error);
    return false;
  }
}
