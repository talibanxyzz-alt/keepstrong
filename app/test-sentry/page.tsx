'use client';

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';

export default function TestSentry() {
  const [status, setStatus] = useState<string>('');

  const testClientError = () => {
    try {
      throw new Error('Test Sentry error from client - ' + new Date().toISOString());
    } catch (error) {
      Sentry.captureException(error);
      setStatus('✅ Client error sent to Sentry! Check your Sentry dashboard.');
    }
  };

  const testServerError = async () => {
    try {
      const response = await fetch('/api/test-sentry');
      if (!response.ok) {
        setStatus('✅ Server error sent to Sentry! Check your Sentry dashboard.');
      }
    } catch (error) {
      setStatus('✅ Server error sent to Sentry! Check your Sentry dashboard.');
    }
  };

  const testMessage = () => {
    Sentry.captureMessage('Test message from Sentry test page - ' + new Date().toISOString(), 'info');
    setStatus('✅ Test message sent to Sentry! Check your Sentry dashboard.');
  };

  const testBreadcrumb = () => {
    Sentry.addBreadcrumb({
      category: 'test',
      message: 'Test breadcrumb added',
      level: 'info',
    });
    setStatus('✅ Breadcrumb added! Check Sentry breadcrumbs.');
  };

  return (
    <div className="min-h-screen bg-cloud p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Sentry Test Page</h1>
        <p className="text-slate mb-6">
          Use these buttons to test Sentry error tracking. Check your{' '}
          <a
            href="https://sentry.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Sentry dashboard
          </a>{' '}
          to see the events.
        </p>

        <div className="bg-surface rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testClientError}
              className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-danger transition-colors font-medium"
            >
              Test Client Error
            </button>
            <button
              onClick={testServerError}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-primary transition-colors font-medium"
            >
              Test Server Error
            </button>
            <button
              onClick={testMessage}
              className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Test Message
            </button>
            <button
              onClick={testBreadcrumb}
              className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
            >
              Test Breadcrumb
            </button>
          </div>
        </div>

        {status && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{status}</p>
          </div>
        )}

        <div className="bg-surface rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sentry Configuration</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">DSN:</span>{' '}
              <span className="text-slate">
                {process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ Configured' : '❌ Not configured'}
              </span>
            </div>
            <div>
              <span className="font-medium">Environment:</span>{' '}
              <span className="text-slate">{process.env.NODE_ENV || 'unknown'}</span>
            </div>
            <div>
              <span className="font-medium">Traces Sample Rate:</span>{' '}
              <span className="text-slate">10%</span>
            </div>
            <div>
              <span className="font-medium">Replay Sample Rate:</span>{' '}
              <span className="text-slate">10% (100% on errors)</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-slate">
          <p>
            <strong>Note:</strong> After clicking a test button, wait a few seconds and check your
            Sentry dashboard. Events may take a moment to appear.
          </p>
        </div>
      </div>
    </div>
  );
}

