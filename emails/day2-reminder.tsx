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

interface Day2ReminderEmailProps {
  name?: string;
  proteinTarget?: number;
  unsubscribeUrl?: string;
}

export const Day2ReminderEmail = ({ 
  name = 'there',
  proteinTarget = 120,
  unsubscribeUrl = '#'
}: Day2ReminderEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '40px', margin: '0', color: '#0C4A6E' }}>💪 KeepStrong</h1>
          </div>

          <Heading style={heading}>Hi {name}! 🍗</Heading>

          <Text style={paragraph}>
            Just checking in! Have you tracked your protein today?
          </Text>

          <div style={{ 
            backgroundColor: '#f1f5f9', 
            borderRadius: '12px', 
            padding: '24px', 
            margin: '32px 0',
            textAlign: 'center'
          }}>
            <Text style={{ fontSize: '16px', color: '#64748b', margin: '0 0 8px 0' }}>
              Your Daily Goal
            </Text>
            <Text style={{ fontSize: '48px', fontWeight: 'bold', color: '#0C4A6E', margin: '0', fontFamily: 'monospace' }}>
              {proteinTarget}g
            </Text>
            <Text style={{ fontSize: '16px', color: '#64748b', margin: '8px 0 0 0' }}>
              of protein per day
            </Text>
          </div>

          <Text style={paragraph}>
            <strong style={{ color: '#1f2937' }}>💡 Quick Tip:</strong><br />
            Aim for 30-40g of protein at each meal to hit your daily target consistently. This helps preserve muscle while you lose weight.
          </Text>

          <Button href={`${baseUrl}/dashboard`} style={button}>
            Log Protein Now →
          </Button>

          <Text style={paragraph}>
            Need help? Reply to this email and we'll get back to you right away.
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

export default Day2ReminderEmail;

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

