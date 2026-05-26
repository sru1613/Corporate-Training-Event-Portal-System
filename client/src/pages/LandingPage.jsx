import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdSchool, MdGroups, MdInsights, MdVerified,
  MdPeople, MdLibraryBooks, MdEmojiEvents, MdStar,
  MdArrowForward, MdCheckCircle, MdTrendingUp, MdNotifications,
} from 'react-icons/md';

/* ─── Animated counter hook ─────────────────────────────────────── */
function useCounter(target, duration = 2000, trigger) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(target * ease));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, trigger]);
  return value;
}

/* ─── Floating particle ──────────────────────────────────────────── */
const Particle = ({ style }) => (
  <div style={{
    position: 'absolute',
    borderRadius: '50%',
    pointerEvents: 'none',
    ...style,
  }} />
);

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);

  const events = useCounter(500, 1800, statsVisible);
  const employees = useCounter(2000, 2000, statsVisible);
  const trainers = useCounter(50, 1600, statsVisible);
  const completion = useCounter(96, 1800, statsVisible);

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'trainer') navigate('/trainer/dashboard', { replace: true });
      else navigate('/employee/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Intersection observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <MdLibraryBooks style={{ fontSize: '2rem' }} />,
      title: 'Rich Event Catalog',
      desc: 'Browse hundreds of curated training events across multiple disciplines, from technical skills to leadership.',
      color: '#00b4d8',
    },
    {
      icon: <MdInsights style={{ fontSize: '2rem' }} />,
      title: 'Real-Time Analytics',
      desc: 'Powerful dashboards give admins and trainers instant visibility into attendance, progress, and outcomes.',
      color: '#48cae4',
    },
    {
      icon: <MdGroups style={{ fontSize: '2rem' }} />,
      title: 'Seamless Collaboration',
      desc: 'Trainers upload materials, manage attendance, and receive post-event feedback — all in one place.',
      color: '#0096c7',
    },
    {
      icon: <MdVerified style={{ fontSize: '2rem' }} />,
      title: 'Verified Completion',
      desc: 'Track completion rates, attendance records, and earn recognition for professional development milestones.',
      color: '#90e0ef',
    },
    {
      icon: <MdNotifications style={{ fontSize: '2rem' }} />,
      title: 'Smart Notifications',
      desc: 'Stay informed with automated alerts for registrations, event updates, and important reminders.',
      color: '#00b4d8',
    },
    {
      icon: <MdTrendingUp style={{ fontSize: '2rem' }} />,
      title: 'Growth Tracking',
      desc: 'Employees and managers can review full training history, feedback scores, and career development arcs.',
      color: '#48cae4',
    },
  ];

  const roles = [
    {
      icon: '🏢',
      role: 'Administrator',
      color: '#0096c7',
      perks: ['Manage all users & events', 'View full analytics & reports', 'Control registrations', 'Send notifications'],
    },
    {
      icon: '🎓',
      role: 'Trainer',
      color: '#00b4d8',
      perks: ['Conduct training sessions', 'Mark attendance live', 'Upload course materials', 'Read participant feedback'],
    },
    {
      icon: '⭐',
      role: 'Employee',
      color: '#48cae4',
      perks: ['Browse & register for events', 'Track your attendance', 'Download materials', 'Submit post-event feedback'],
    },
  ];

  // Particles config
  const particles = Array.from({ length: 18 }, (_, i) => ({
    width: `${6 + (i % 5) * 8}px`,
    height: `${6 + (i % 5) * 8}px`,
    top: `${(i * 17 + 5) % 95}%`,
    left: `${(i * 23 + 8) % 96}%`,
    background: `rgba(${[72, 202, 228][i % 3]}, ${[72, 202, 228][(i + 1) % 3]}, ${[228, 72, 202][(i + 2) % 3]}, ${0.04 + (i % 4) * 0.02})`,
    animation: `particleFloat ${6 + (i % 5) * 2}s ease-in-out ${(i % 6) * 0.8}s infinite alternate`,
  }));

  if (loading) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #03045e 0%, #023e8a 35%, #0077b6 65%, #0096c7 100%)',
      overflowX: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* ── Background particles ── */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p, i) => <Particle key={i} style={p} />)}
        {/* Large glow orbs */}
        {[
          { w: '700px', top: '-10%', left: '-5%', color: 'rgba(0,150,199,0.08)' },
          { w: '600px', top: '40%', left: '75%', color: 'rgba(72,202,228,0.07)' },
          { w: '500px', top: '70%', left: '20%', color: 'rgba(0,177,216,0.06)' },
        ].map((orb, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: orb.w, height: orb.w,
            top: orb.top, left: orb.left,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            animation: `orbFloat ${12 + i * 3}s ease-in-out ${i * 2}s infinite alternate`,
          }} />
        ))}
      </div>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        padding: '1rem 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(3, 4, 94, 0.4)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #00b4d8, #0077b6)',
            display: 'grid', placeItems: 'center', fontSize: '1.5rem', color: 'white',
            boxShadow: '0 0 20px rgba(0,180,216,0.4)',
          }}>
            <MdSchool />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              Corporate Training Portal
            </div>
            <div style={{ color: 'rgba(173,232,244,0.6)', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Enterprise Learning Platform
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="landing-btn-outline"
        >
          Sign In
        </button>
      </nav>

      {/* ══════════════════════════════════════════════════════════
           HERO SECTION
         ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '8rem 1.5rem 5rem',
      }}>
        {/* Eyebrow badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(0,180,216,0.15)',
          border: '1px solid rgba(0,180,216,0.35)',
          borderRadius: '9999px',
          padding: '0.45rem 1.3rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)',
        }}>
          <MdStar style={{ color: '#48cae4', fontSize: '0.9rem' }} />
          <span style={{ color: '#ade8f4', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Enterprise Learning &amp; Development
          </span>
        </div>

        {/* Main headline */}
        <h1 style={{
          fontSize: 'clamp(2.6rem, 8vw, 5.5rem)',
          fontWeight: 900,
          color: 'white',
          lineHeight: 1.05,
          letterSpacing: '-3px',
          marginBottom: '1.5rem',
          maxWidth: '960px',
          textShadow: '0 2px 40px rgba(0,0,0,0.3)',
        }}>
          Elevate Your Team's
          <span style={{
            display: 'block',
            background: 'linear-gradient(90deg, #48cae4 0%, #ade8f4 50%, #caf0f8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Professional Growth
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: 'rgba(202, 240, 248, 0.82)',
          maxWidth: '620px',
          lineHeight: 1.75,
          marginBottom: '3.5rem',
        }}>
          One powerful platform connecting admins, trainers, and employees to manage training events, track progress, and unlock organizational excellence.
        </p>

        {/* CTA Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={() => navigate('/login')}
            className="landing-cta-btn"
          >
            <span>Continue</span>
            <MdArrowForward style={{ fontSize: '1.3rem' }} />
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            color: 'rgba(173,232,244,0.55)', fontSize: '0.82rem',
          }}>
            <MdCheckCircle style={{ fontSize: '1rem', color: '#48cae4' }} />
            Access your employee, trainer, or admin portal
          </div>
        </div>

        {/* Floating preview cards */}
        <div style={{
          display: 'flex', gap: '1rem', marginTop: '4.5rem', flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {[
            { icon: '📋', label: 'Register for Events' },
            { icon: '📊', label: 'Track Progress' },
            { icon: '⭐', label: 'Submit Feedback' },
            { icon: '📁', label: 'Access Materials' },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '14px',
              padding: '0.75rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              color: '#caf0f8', fontSize: '0.875rem', fontWeight: 500,
            }}>
              <span style={{ fontSize: '1.1rem' }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.4,
        }}>
          <span style={{ color: '#caf0f8', fontSize: '0.68rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{
            width: '1px', height: '44px',
            background: 'linear-gradient(to bottom, rgba(202,240,248,0.7), transparent)',
          }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           STATS SECTION
         ══════════════════════════════════════════════════════════ */}
      <section ref={statsRef} style={{
        position: 'relative', zIndex: 1,
        padding: '5rem 2rem',
        background: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{
          maxWidth: '1000px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem', textAlign: 'center',
        }}>
          {[
            { value: events, suffix: '+', label: 'Training Events', icon: <MdEmojiEvents style={{ fontSize: '2rem' }} /> },
            { value: employees, suffix: '+', label: 'Employees Trained', icon: <MdPeople style={{ fontSize: '2rem' }} /> },
            { value: trainers, suffix: '+', label: 'Expert Trainers', icon: <MdGroups style={{ fontSize: '2rem' }} /> },
            { value: completion, suffix: '%', label: 'Completion Rate', icon: <MdVerified style={{ fontSize: '2rem' }} /> },
          ].map(({ value, suffix, label, icon }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ color: '#48cae4', marginBottom: '0.25rem' }}>{icon}</div>
              <div style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-2px',
              }}>
                {value.toLocaleString()}{suffix}
              </div>
              <div style={{ color: 'rgba(173,232,244,0.65)', fontSize: '0.9rem', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           FEATURES SECTION
         ══════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '7rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(0,180,216,0.12)',
              border: '1px solid rgba(0,180,216,0.3)',
              borderRadius: '9999px', padding: '0.3rem 1rem',
              color: '#90e0ef', fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1.25rem',
            }}>
              Platform Features
            </div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800,
              color: 'white', letterSpacing: '-1.5px', lineHeight: 1.15,
              marginBottom: '1rem',
            }}>
              Everything Your Organization Needs
            </h2>
            <p style={{
              color: 'rgba(173,232,244,0.7)', fontSize: '1.1rem',
              maxWidth: '540px', margin: '0 auto', lineHeight: 1.7,
            }}>
              Designed for modern enterprises to streamline every aspect of employee training and development.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {features.map((feat, i) => (
              <div
                key={feat.title}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  background: hoveredFeature === i
                    ? `rgba(0,180,216,0.1)`
                    : 'rgba(255,255,255,0.045)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${hoveredFeature === i ? 'rgba(0,180,216,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '20px',
                  padding: '2rem',
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                  transform: hoveredFeature === i ? 'translateY(-8px)' : 'translateY(0)',
                }}
              >
                <div style={{
                  width: '54px', height: '54px', borderRadius: '14px',
                  background: `${feat.color}20`,
                  border: `1px solid ${feat.color}40`,
                  display: 'grid', placeItems: 'center',
                  color: feat.color, marginBottom: '1.25rem',
                }}>
                  {feat.icon}
                </div>
                <h3 style={{
                  color: 'white', fontWeight: 700, fontSize: '1.05rem',
                  marginBottom: '0.75rem', letterSpacing: '-0.3px',
                }}>
                  {feat.title}
                </h3>
                <p style={{ color: 'rgba(173,232,244,0.65)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           ROLES SECTION
         ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '5rem 2rem 7rem',
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800,
              color: 'white', letterSpacing: '-1.5px', marginBottom: '1rem',
            }}>
              Built for Every Role
            </h2>
            <p style={{
              color: 'rgba(173,232,244,0.65)', fontSize: '1.05rem',
              maxWidth: '480px', margin: '0 auto', lineHeight: 1.7,
            }}>
              Tailored dashboards and tools for every member of your organization.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {roles.map((r, i) => (
              <div
                key={r.role}
                onMouseEnter={() => setHoveredRole(i)}
                onMouseLeave={() => setHoveredRole(null)}
                style={{
                  background: hoveredRole === i
                    ? `${r.color}15`
                    : 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${hoveredRole === i ? `${r.color}50` : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '22px',
                  padding: '2.25rem 2rem',
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                  transform: hoveredRole === i ? 'translateY(-6px)' : 'translateY(0)',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }}>{r.icon}</div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: `${r.color}25`,
                  border: `1px solid ${r.color}45`,
                  borderRadius: '9999px',
                  padding: '0.3rem 1rem',
                  color: r.color,
                  fontWeight: 700, fontSize: '0.85rem',
                  marginBottom: '1.5rem',
                }}>
                  {r.role}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {r.perks.map(perk => (
                    <li key={perk} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                      color: 'rgba(202,240,248,0.75)', fontSize: '0.9rem', lineHeight: 1.5,
                    }}>
                      <MdCheckCircle style={{ color: r.color, fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }} />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           FINAL CTA SECTION
         ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '8rem 2rem',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,180,216,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900,
            color: 'white', letterSpacing: '-2px', lineHeight: 1.1,
            marginBottom: '1.25rem',
          }}>
            Ready to Transform
            <span style={{
              display: 'block',
              background: 'linear-gradient(90deg, #48cae4, #ade8f4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Your Organization?
            </span>
          </h2>
          <p style={{
            color: 'rgba(173,232,244,0.72)', fontSize: '1.1rem',
            lineHeight: 1.7, marginBottom: '3rem',
          }}>
            Join thousands of professionals using the Corporate Training Portal to build skills, track progress, and drive organizational growth.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="landing-cta-btn"
            style={{ margin: '0 auto' }}
          >
            <span>Continue to Portal</span>
            <MdArrowForward style={{ fontSize: '1.3rem' }} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        padding: '2.5rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #00b4d8, #0077b6)',
            display: 'grid', placeItems: 'center', fontSize: '1.1rem', color: 'white',
          }}>
            <MdSchool />
          </div>
          <span style={{ color: 'rgba(173,232,244,0.8)', fontWeight: 700, fontSize: '0.95rem' }}>
            Corporate Training Portal
          </span>
        </div>
        <p style={{ color: 'rgba(173,232,244,0.35)', fontSize: '0.78rem' }}>
          © 2026 Corporate Training Portal. All rights reserved.
        </p>
      </footer>

      {/* ── Global landing page styles ── */}
      <style>{`
        .landing-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #00b4d8 0%, #0096c7 100%);
          border: none;
          color: white;
          padding: 1.1rem 3rem;
          border-radius: 16px;
          font-size: 1.15rem;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: -0.2px;
          box-shadow: 0 0 40px rgba(0,180,216,0.45), 0 16px 48px rgba(0,0,0,0.3);
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow: hidden;
        }
        .landing-cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .landing-cta-btn:hover::before {
          opacity: 1;
        }
        .landing-cta-btn:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 0 70px rgba(0,180,216,0.65), 0 24px 64px rgba(0,0,0,0.4);
        }
        .landing-cta-btn:active {
          transform: translateY(-2px) scale(1.01);
        }

        .landing-btn-outline {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.25);
          color: white;
          padding: 0.55rem 1.4rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.88rem;
          backdrop-filter: blur(12px);
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .landing-btn-outline:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.4);
        }

        @keyframes orbFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(20px, -30px) scale(1.08); }
        }
        @keyframes particleFloat {
          0% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          100% { transform: translate(12px, -20px) scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
