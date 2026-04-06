import React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Text,
} from '@react-email/components';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface WelcomeEmailProps {
  name?: string;
  unsubscribeUrl?: string;
}

export const WelcomeEmail = ({ 
  name = 'there', 
  unsubscribeUrl = '#' 
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          {/* Logo/Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '40px', margin: '0', color: '#0C4A6E' }}>💪 KeepStrong</h1>
          </div>

          <Heading style={heading}>Hi {name}! 👋</Heading>

          <Text style={paragraph}>
            Welcome to KeepStrong! You're taking the first step to staying strong while losing weight on your GLP-1 journey.
          </Text>

          <Text style={paragraph}>
            Here's what to do next:
          </Text>

          <div style={{ margin: '24px 0' }}>
            <Text style={{ ...paragraph, marginBottom: '8px' }}>
              <strong style={{ color: '#1f2937' }}>1. Complete your profile</strong><br />
              Tell us about your weight, height, and GLP-1 medication so we can calculate your personalized protein target.
            </Text>

            <Text style={{ ...paragraph, marginBottom: '8px' }}>
              <strong style={{ color: '#1f2937' }}>2. Log your first protein meal</strong><br />
              Start tracking today! Use our quick-add buttons to log breakfast, lunch, or dinner in seconds.
            </Text>

            <Text style={{ ...paragraph, marginBottom: '8px' }}>
              <strong style={{ color: '#1f2937' }}>3. Start a workout program</strong><br />
              Choose from Beginner, Intermediate, or Advanced programs designed to preserve muscle mass.
            </Text>
          </div>

          <Button href={`${baseUrl}/onboarding`} style={button}>
            Get Started →
          </Button>

          <Text style={paragraph}>
            Questions? Just reply to this email and we'll help you out.
          </Text>

          <Text style={{ ...paragraph, marginTop: '48px' }}>
            Stay strong,<br />
            <strong>The KeepStrong Team</strong>
          </Text>

          <div style={footer}>
            <Text>
              You're receiving this because you signed up for KeepStrong.
            </Text>
          </div>

          <div style={unsubscribe}>
            <Link href={unsubscribeUrl} style={{ color: '#64748b' }}>
              Unsubscribe from these emails
            </Link>
          </div>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

// Styles
const main = {
  backgroundColor: '#f1f5f9',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#1f2937',
};

const paragraph = {
  fontSize: '18px',
  lineHeight: '1.6',
  color: '#64748b',
  margin: '16px 0',
};

const button = {
  backgroundColor: '#0C4A6E',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '18px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 32px',
  margin: '32px 0',
};

const footer = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  marginTop: '48px',
};

const unsubscribe = {
  color: '#64748b',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '24px',
};

