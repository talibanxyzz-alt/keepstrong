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

interface Week1ProgressEmailProps {
  name?: string;
  daysLogged?: number;
  workoutsCompleted?: number;
  weightChange?: number | null;
  unsubscribeUrl?: string;
}

export const Week1ProgressEmail = ({ 
  name = 'there',
  daysLogged = 5,
  workoutsCompleted = 2,
  weightChange = -2.5,
  unsubscribeUrl = '#'
}: Week1ProgressEmailProps) => {
  const getWeightChangeText = () => {
    if (weightChange === null) return 'No weight logged yet';
    if (weightChange === 0) return 'No change';
    if (weightChange > 0) return `+${weightChange.toFixed(1)} lbs`;
    return `${weightChange.toFixed(1)} lbs`;
  };

  const getWeightChangeColor = () => {
    if (weightChange === null || weightChange === 0) return '#64748b';
    return weightChange < 0 ? '#059669' : '#64748b';
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '40px', margin: '0', color: '#0C4A6E' }}>💪 KeepStrong</h1>
            </div>

            <Heading style={heading}>Hi {name}! 📊</Heading>

            <Text style={paragraph}>
              You've been using KeepStrong for a week! Here's your progress:
            </Text>

            {/* Stats Grid */}
            <div style={{ margin: '32px 0' }}>
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={{ padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '12px', textAlign: 'center', width: '33%' }}>
                    <Text style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>
                      Protein Logged
                    </Text>
                    <Text style={{ fontSize: '32px', fontWeight: 'bold', color: '#0C4A6E', margin: '0', fontFamily: 'monospace' }}>
                      {daysLogged}/7
                    </Text>
                    <Text style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 0 0' }}>
                      days
                    </Text>
                  </td>
                  <td style={{ width: '2%' }}></td>
                  <td style={{ padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '12px', textAlign: 'center', width: '33%' }}>
                    <Text style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>
                      Workouts
                    </Text>
                    <Text style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669', margin: '0', fontFamily: 'monospace' }}>
                      {workoutsCompleted}
                    </Text>
                    <Text style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 0 0' }}>
                      completed
                    </Text>
                  </td>
                  <td style={{ width: '2%' }}></td>
                  <td style={{ padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '12px', textAlign: 'center', width: '33%' }}>
                    <Text style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>
                      Weight Change
                    </Text>
                    <Text style={{ fontSize: '32px', fontWeight: 'bold', color: getWeightChangeColor(), margin: '0', fontFamily: 'monospace' }}>
                      {getWeightChangeText()}
                    </Text>
                    <Text style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 0 0' }}>
                      {weightChange !== null && weightChange < 0 ? '🎉' : ''}
                    </Text>
                  </td>
                </tr>
              </table>
            </div>

            <div style={{ 
              backgroundColor: '#dcfce7', 
              borderLeft: '4px solid #059669',
              borderRadius: '8px', 
              padding: '16px 24px', 
              margin: '32px 0'
            }}>
              <Text style={{ fontSize: '16px', color: '#065f46', margin: '0', fontWeight: '600' }}>
                💪 Keep going! Consistency is key.
              </Text>
              <Text style={{ fontSize: '14px', color: '#065f46', margin: '8px 0 0 0' }}>
                You're building habits that will preserve muscle mass while you lose weight. Every protein meal and workout matters.
              </Text>
            </div>

            <Button href={`${baseUrl}/progress`} style={button}>
              View Full Progress →
            </Button>

            <Text style={paragraph}>
              Have questions about your progress? Just hit reply!
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
};

export default Week1ProgressEmail;

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

