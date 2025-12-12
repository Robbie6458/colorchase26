"use client";

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: 1.8 }}>
        <h1 style={{ fontSize: '2.5em', marginBottom: '10px', textAlign: 'center', backgroundImage: 'linear-gradient(135deg, #ffd700, #ffaa00)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Privacy Policy
        </h1>
        <p style={{ textAlign: 'center', color: '#a0a0c0', marginBottom: '40px' }}>
          Last updated: December 2025
        </p>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5em', color: '#9aa0ff', marginBottom: '15px' }}>1. Introduction</h2>
          <p>
            Color Chase ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit and use our game and services.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5em', color: '#9aa0ff', marginBottom: '15px' }}>2. Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect on the site includes:
          </p>
          <ul style={{ marginLeft: '20px', color: '#a0a0c0' }}>
            <li>Game statistics and puzzle completion data</li>
            <li>Palette history and preferences</li>
            <li>Device and browser information</li>
            <li>Email address (if you choose to create an account)</li>
            <li>Usage patterns and analytics data</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5em', color: '#9aa0ff', marginBottom: '15px' }}>3. Use of Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the site to:
          </p>
          <ul style={{ marginLeft: '20px', color: '#a0a0c0' }}>
            <li>Generate a personal profile so you can quickly access your puzzle history</li>
            <li>Improve our game and services</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Perform analytics and track usage trends</li>
            <li>Notify you of updates and changes to our services</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5em', color: '#9aa0ff', marginBottom: '15px' }}>4. Disclosure of Your Information</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. However, we may share your information with trusted service providers who assist us in operating our website and conducting our business, subject to confidentiality agreements.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5em', color: '#9aa0ff', marginBottom: '15px' }}>5. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5em', color: '#9aa0ff', marginBottom: '15px' }}>6. Cookies and Tracking</h2>
          <p>
            We may use cookies and similar tracking technologies to enhance your experience. You can choose to disable cookies through your browser settings, though this may affect your ability to use certain features of the site.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5em', color: '#9aa0ff', marginBottom: '15px' }}>7. Local Storage</h2>
          <p>
            Color Chase uses browser local storage to save your puzzle progress and palette collection locally on your device. This data remains under your control and is not transmitted to our servers unless you explicitly create an account and choose to sync your data.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5em', color: '#9aa0ff', marginBottom: '15px' }}>8. Changes to This Privacy Policy</h2>
          <p>
            We reserve the right to modify this Privacy Policy at any time. Changes and clarifications will take effect immediately upon their posting to the website. If we make material changes to this policy, we will notify you here or by other means so that you are aware of what information we collect and how we use it.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5em', color: '#9aa0ff', marginBottom: '15px' }}>9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at privacy@colorchasegame.com.
          </p>
        </section>

        <div style={{ marginTop: '50px', textAlign: 'center' }}>
          <a href="/" style={{ color: '#9aa0ff', textDecoration: 'none', fontSize: '1.1em' }} className="privacy-back-link">
            ← Back to Game
          </a>
        </div>
      </div>
    </div>
  );
}
