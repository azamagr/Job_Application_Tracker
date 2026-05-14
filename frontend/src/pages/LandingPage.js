import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '📋', title: 'Track Applications', desc: 'Manage all your job applications in one place — company, position, status, and more.' },
  { icon: '🔔', title: 'Set Reminders', desc: 'Set reminders for interviews and follow-ups — receive email notifications.' },
  { icon: '📄', title: 'Upload Documents', desc: 'Securely upload and manage your resumes and cover letters.' },
  { icon: '📊', title: 'Dashboard & Reports', desc: 'View your job search progress with charts and statistics.' },
  { icon: '💼', title: 'Browse Jobs', desc: 'View jobs posted by the admin and apply directly through the platform.' },
  { icon: '🔍', title: 'Search & Filter', desc: 'Filter applications easily by status, company, or date.' },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#F5F4F0', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid rgba(0,0,0,.08)',
        padding: '0 40px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: '#185FA5', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
          }}>💼</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#1a1a18' }}>Job Application Tracker</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: '1px solid rgba(0,0,0,.12)', background: '#fff',
              color: '#1a1a18', cursor: 'pointer'
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: 'none', background: '#185FA5',
              color: '#fff', cursor: 'pointer'
            }}
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '72px 24px 56px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{
          display: 'inline-block', background: '#E6F1FB', color: '#185FA5',
          padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          marginBottom: 20
        }}>
          BSSE Final Year Project
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: '#1a1a18', lineHeight: 1.25, marginBottom: 16 }}>
          Keep Your Job Search<br />
          <span style={{ color: '#185FA5' }}>Organized</span>
        </h1>
        <p style={{ fontSize: 15, color: '#5F5E5A', lineHeight: 1.7, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
          Job Application Tracker is a platform where you can track all your applications,
          set reminders, and view complete insights into your job search progress.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '11px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              border: 'none', background: '#185FA5', color: '#fff',
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(24,95,165,.3)'
            }}
          >
            🚀 Get Started — Free
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '11px 28px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              border: '1px solid rgba(0,0,0,.12)', background: '#fff',
              color: '#1a1a18', cursor: 'pointer'
            }}
          >
            Login →
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ background: '#185FA5', padding: '20px 40px', display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap' }}>
        {[
          { num: '12', label: 'Use Cases' },
          { num: '2', label: 'Roles (User & Admin)' },
          { num: '100%', label: 'Free to Use' },
          { num: '24/7', label: 'Access' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{s.num}</div>
            <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#1a1a18' }}>
          What do you get?
        </h2>
        <p style={{ textAlign: 'center', color: '#5F5E5A', fontSize: 14, marginBottom: 36 }}>
          All features in one place — completely free
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {features.map(f => (
            <div key={f.title} style={{
              background: '#fff', borderRadius: 12,
              border: '1px solid rgba(0,0,0,.07)', padding: '20px 18px'
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: '#1a1a18' }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#5F5E5A', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: '#fff', padding: '48px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, marginBottom: 36, color: '#1a1a18' }}>
          How does it work?
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, maxWidth: 700, margin: '0 auto', flexWrap: 'wrap' }}>
          {[
            { step: '1', title: 'Register', desc: 'Create a free account using your email' },
            { step: '2', title: 'Browse Jobs', desc: 'View jobs posted by the admin' },
            { step: '3', title: 'Apply', desc: 'Apply for jobs or add applications manually' },
            { step: '4', title: 'Track Progress', desc: 'Update statuses and monitor your progress' },
          ].map((s, i) => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
              <div style={{ textAlign: 'center', width: 150, padding: '0 8px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: '#185FA5',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16, margin: '0 auto 10px'
                }}>{s.step}</div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
              {i < 3 && <div style={{ paddingTop: 20, color: '#ccc', fontSize: 20, flexShrink: 0 }}>→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Bottom */}
      <div style={{ textAlign: 'center', padding: '56px 24px', background: '#F5F4F0' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#1a1a18' }}>
          Ready to get started?
        </h2>
        <p style={{ color: '#5F5E5A', fontSize: 14, marginBottom: 24 }}>
          Create your account and organize your job search today
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '11px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              border: 'none', background: '#185FA5', color: '#fff', cursor: 'pointer'
            }}
          >
            Register — Free
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '11px 28px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              border: '1px solid rgba(0,0,0,.12)', background: '#fff',
              color: '#1a1a18', cursor: 'pointer'
            }}
          >
            Login
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#1a1a18', color: '#888', textAlign: 'center', padding: '16px', fontSize: 12 }}>
        Job Application Tracker — BSSE Final Year Project © 2026
      </div>

    </div>
  );
};

export default LandingPage;