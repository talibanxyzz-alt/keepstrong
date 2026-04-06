import React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { WeeklyStats } from "@/lib/emails/getWeeklyStats";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface WeeklyDigestEmailProps {
  stats: WeeklyStats;
  unsubscribeUrl: string;
}

const main = {
  backgroundColor: "#f1f5f9",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#1f2937",
};

const paragraph = {
  fontSize: "18px",
  lineHeight: "1.6",
  color: "#64748b",
  margin: "16px 0",
};

const button = {
  backgroundColor: "#0C4A6E",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "18px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "16px 32px",
  margin: "32px 0",
};

const footer = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "24px",
  textAlign: "center" as const,
  marginTop: "48px",
};

const unsubscribe = {
  color: "#64748b",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "24px",
};

function proteinCoachMessage(daysHit: number): string {
  if (daysHit >= 5) {
    return "Outstanding week on protein. You're building a real habit.";
  }
  if (daysHit >= 3) {
    return "Solid effort on protein. Three more consistent days and you'll be unstoppable.";
  }
  return "Protein was tough this week — and that's okay. One logged meal is better than zero.";
}

function weightSummaryText(stats: WeeklyStats): string {
  if (stats.weightChange === null) {
    return "No weight logged this week.";
  }
  const v = stats.weightChange;
  const sign = v > 0 ? "+" : "";
  return `Your weight changed by ${sign}${v.toFixed(1)} kg this week.`;
}

export const WeeklyDigestEmail = ({ stats, unsubscribeUrl }: WeeklyDigestEmailProps) => (
  <Html>
    <Head />
    <Preview>Your KeepStrong week in review</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1 style={{ fontSize: "40px", margin: "0", color: "#0C4A6E" }}>💪 KeepStrong</h1>
          </div>

          <Heading style={heading}>
            Hey {stats.userName}, here&apos;s how your week looked
          </Heading>

          <Text style={paragraph}>
            Here&apos;s your snapshot for {stats.weekStart} → {stats.weekEnd}.
          </Text>

          <div style={{ margin: "32px 0" }}>
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "16px",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "12px",
                      textAlign: "center",
                      width: "33%",
                    }}
                  >
                    <Text style={{ fontSize: "14px", color: "#64748b", margin: "0 0 8px 0" }}>
                      Protein goal days
                    </Text>
                    <Text
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        color: "#0C4A6E",
                        margin: "0",
                        fontFamily: "monospace",
                      }}
                    >
                      {stats.proteinDaysHit}/7
                    </Text>
                    <Text style={{ fontSize: "14px", color: "#64748b", margin: "8px 0 0 0" }}>
                      days at {stats.proteinGoal}g+
                    </Text>
                  </td>
                  <td style={{ width: "2%" }} />
                  <td
                    style={{
                      padding: "16px",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "12px",
                      textAlign: "center",
                      width: "33%",
                    }}
                  >
                    <Text style={{ fontSize: "14px", color: "#64748b", margin: "0 0 8px 0" }}>
                      Workouts
                    </Text>
                    <Text
                      style={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        color: "#059669",
                        margin: "0",
                        fontFamily: "monospace",
                      }}
                    >
                      {stats.workoutsCompleted}
                    </Text>
                    <Text style={{ fontSize: "14px", color: "#64748b", margin: "8px 0 0 0" }}>
                      {stats.workoutMinutes > 0
                        ? `${stats.workoutMinutes} min total`
                        : "completed"}
                    </Text>
                  </td>
                  <td style={{ width: "2%" }} />
                  <td
                    style={{
                      padding: "16px",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "12px",
                      textAlign: "center",
                      width: "33%",
                    }}
                  >
                    <Text style={{ fontSize: "14px", color: "#64748b", margin: "0 0 8px 0" }}>
                      Weight
                    </Text>
                    <Text
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#1f2937",
                        margin: "0",
                        lineHeight: "1.4",
                      }}
                    >
                      {weightSummaryText(stats)}
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={{
              backgroundColor: "#e0f2fe",
              borderLeft: "4px solid #0C4A6E",
              borderRadius: "8px",
              padding: "16px 24px",
              margin: "32px 0",
            }}
          >
            <Text style={{ fontSize: "16px", color: "#0c4a6e", margin: "0", fontWeight: "600" }}>
              This week&apos;s focus
            </Text>
            <Text style={{ fontSize: "14px", color: "#334155", margin: "8px 0 0 0" }}>
              {proteinCoachMessage(stats.proteinDaysHit)}
            </Text>
          </div>

          {stats.hydrationAvgMl != null && (
            <Text style={paragraph}>
              Hydration: about <strong style={{ color: "#1f2937" }}>{stats.hydrationAvgMl} ml</strong>{" "}
              per day on average
              {stats.hydrationGoalMl != null ? (
                <>
                  {" "}
                  (goal ~{stats.hydrationGoalMl} ml/day).
                </>
              ) : (
                "."
              )}
            </Text>
          )}

          {stats.currentProteinStreak > 2 && (
            <Text style={paragraph}>
              You&apos;re on a <strong style={{ color: "#1f2937" }}>{stats.currentProteinStreak}-day</strong>{" "}
              protein goal streak — nice consistency.
            </Text>
          )}

          <Button href={`${baseUrl}/dashboard`} style={button}>
            Open KeepStrong →
          </Button>

          <Text style={{ ...paragraph, marginTop: "48px" }}>
            Stay strong,
            <br />
            <strong>The KeepStrong Team</strong>
          </Text>

          <div style={footer}>
            <Text>KeepStrong — [Your company legal name and mailing address]</Text>
            <Text>You&apos;re receiving this because you opted in to product emails.</Text>
          </div>

          <div style={unsubscribe}>
            <Link href={unsubscribeUrl} style={{ color: "#64748b" }}>
              Unsubscribe from these emails
            </Link>
          </div>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WeeklyDigestEmail;
