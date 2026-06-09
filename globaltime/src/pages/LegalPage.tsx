import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, Eye, AlertTriangle, Scale, Ban, Settings, ChevronDown } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { AdSlotComponent } from '../components/AdSlot';

const SITE = 'https://globaltime-pi.vercel.app';
const BRAND = 'World Clock';
const EMAIL = 'privacy@worldclock.live';
const UPDATED = 'June 9, 2026';

interface Section {
  id: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  content: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: 'privacy',
    icon: <Shield size={20} />,
    color: '#00d4ff',
    title: 'Privacy Policy',
    content: (
      <div className="space-y-4 text-white/70 text-sm leading-relaxed">
        <p><strong className="text-white">Effective date:</strong> {UPDATED}</p>
        <p>{BRAND} ("we", "us", or "our") operates {SITE} (the "Service"). This Privacy Policy explains how we collect, use, and protect your information.</p>
        <h4 className="text-white font-semibold mt-4">1. Information We Collect</h4>
        <p><strong className="text-white/90">Automatically Collected:</strong> When you visit our site, we may automatically collect your IP address, browser type, operating system, referring URLs, pages visited, and time spent on pages. This is standard web analytics data.</p>
        <p><strong className="text-white/90">Local Storage / Cookies:</strong> We use your browser's localStorage to save game scores, leaderboard names, language preferences, and ad display settings. This data never leaves your device unless you explicitly submit a score.</p>
        <p><strong className="text-white/90">No Account Required:</strong> We do not require registration or accounts. We do not collect your name, email, or payment information.</p>
        <h4 className="text-white font-semibold mt-4">2. How We Use Your Information</h4>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>To provide and improve the Service</li>
          <li>To understand how users interact with our site (analytics)</li>
          <li>To display relevant advertisements via Google AdSense</li>
          <li>To maintain leaderboard functionality</li>
        </ul>
        <h4 className="text-white font-semibold mt-4">3. Third-Party Services</h4>
        <p>We use the following third-party services which may collect data per their own privacy policies:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong className="text-white/90">Google AdSense</strong> — displays ads, may use cookies for personalization</li>
          <li><strong className="text-white/90">Google Analytics / Vercel Analytics</strong> — anonymous usage data</li>
          <li><strong className="text-white/90">Google Translate</strong> — translation services</li>
          <li><strong className="text-white/90">Open-Meteo</strong> — weather data (no personal data sent)</li>
        </ul>
        <h4 className="text-white font-semibold mt-4">4. Data Retention</h4>
        <p>Analytics data is retained for up to 26 months. localStorage data is retained on your device until you clear it. We do not maintain a server-side database of personal user data.</p>
        <h4 className="text-white font-semibold mt-4">5. Your Rights (GDPR / CCPA)</h4>
        <p>Depending on your jurisdiction, you may have rights to access, correct, delete, or port your data, and to object to or restrict processing. Contact us at <a href={`mailto:${EMAIL}`} className="text-cyan-400 hover:underline">{EMAIL}</a>.</p>
        <h4 className="text-white font-semibold mt-4">6. Children's Privacy</h4>
        <p>Our Service is not directed at children under 13. We do not knowingly collect personal information from children.</p>
        <h4 className="text-white font-semibold mt-4">7. Contact</h4>
        <p>Questions? Email us at <a href={`mailto:${EMAIL}`} className="text-cyan-400 hover:underline">{EMAIL}</a>.</p>
      </div>
    ),
  },
  {
    id: 'terms',
    icon: <Scale size={20} />,
    color: '#a855f7',
    title: 'Terms & Conditions',
    content: (
      <div className="space-y-4 text-white/70 text-sm leading-relaxed">
        <p><strong className="text-white">Effective date:</strong> {UPDATED}</p>
        <p>By accessing or using {BRAND} at {SITE}, you agree to be bound by these Terms & Conditions. If you disagree, please do not use the Service.</p>
        <h4 className="text-white font-semibold mt-4">1. Use of Service</h4>
        <p>The Service provides real-time world clocks, timezone information, mini-games, weather data, and educational content. All content is for informational and entertainment purposes only. Time data is derived from IANA timezone databases and device clocks and may not be suitable for critical applications.</p>
        <h4 className="text-white font-semibold mt-4">2. Acceptable Use</h4>
        <p>You agree not to:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Scrape or systematically download site content without permission</li>
          <li>Use the Service for any unlawful purpose</li>
          <li>Attempt to interfere with the proper working of the Service</li>
          <li>Transmit malicious code, viruses, or disruptive data</li>
          <li>Impersonate any person or entity</li>
        </ul>
        <h4 className="text-white font-semibold mt-4">3. Intellectual Property</h4>
        <p>All original content, design, graphics, and software on {BRAND} are the property of {BRAND} or its licensors and are protected by copyright law. You may not reproduce, distribute, or create derivative works without written permission.</p>
        <h4 className="text-white font-semibold mt-4">4. Third-Party Links</h4>
        <p>The Service may contain links to third-party websites. We are not responsible for the content, privacy practices, or accuracy of those sites.</p>
        <h4 className="text-white font-semibold mt-4">5. Disclaimer of Warranties</h4>
        <p>The Service is provided "as is" without any warranties, express or implied. We do not warrant that the Service will be error-free, uninterrupted, or accurate for any particular purpose.</p>
        <h4 className="text-white font-semibold mt-4">6. Limitation of Liability</h4>
        <p>To the fullest extent permitted by law, {BRAND} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</p>
        <h4 className="text-white font-semibold mt-4">7. Governing Law</h4>
        <p>These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict-of-law provisions.</p>
        <h4 className="text-white font-semibold mt-4">8. Changes to Terms</h4>
        <p>We reserve the right to modify these Terms at any time. Continued use of the Service constitutes acceptance of the updated Terms.</p>
      </div>
    ),
  },
  {
    id: 'advertising',
    icon: <Eye size={20} />,
    color: '#f59e0b',
    title: 'Advertising Policy',
    content: (
      <div className="space-y-4 text-white/70 text-sm leading-relaxed">
        <p><strong className="text-white">Effective date:</strong> {UPDATED}</p>
        <h4 className="text-white font-semibold mt-4">1. How We Use Advertising</h4>
        <p>{BRAND} is funded in part by advertising revenue. We display ads through <strong className="text-white/90">Google AdSense</strong> (publisher ID: ca-pub-1924565904520635). These ads help us maintain free access to all site features.</p>
        <h4 className="text-white font-semibold mt-4">2. Personalized Advertising</h4>
        <p>Google AdSense may use cookies and similar tracking technologies to serve ads based on your prior visits to this and other websites. This is called interest-based or personalized advertising.</p>
        <h4 className="text-white font-semibold mt-4">3. Your Ad Choices</h4>
        <p>You can opt out of personalized advertising by visiting:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google Ad Settings</a></li>
          <li><a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Digital Advertising Alliance Opt-Out</a></li>
          <li><a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Network Advertising Initiative Opt-Out</a></li>
        </ul>
        <h4 className="text-white font-semibold mt-4">4. ads.txt</h4>
        <p>We maintain an <a href="/ads.txt" className="text-cyan-400 hover:underline">ads.txt</a> file to prevent unauthorized selling of our ad inventory.</p>
        <h4 className="text-white font-semibold mt-4">5. Affiliate Links</h4>
        <p>We do not currently use affiliate links. If this changes, all affiliate relationships will be clearly disclosed.</p>
        <h4 className="text-white font-semibold mt-4">6. Ad Standards</h4>
        <p>We do not display ads that promote illegal products, adult content, misleading health claims, or other content prohibited by Google AdSense policies.</p>
      </div>
    ),
  },
  {
    id: 'disclaimer',
    icon: <AlertTriangle size={20} />,
    color: '#ef4444',
    title: 'Disclaimer',
    content: (
      <div className="space-y-4 text-white/70 text-sm leading-relaxed">
        <p><strong className="text-white">Effective date:</strong> {UPDATED}</p>
        <h4 className="text-white font-semibold mt-4">1. Accuracy of Time Data</h4>
        <p>All time and timezone data on {BRAND} is derived from the IANA Timezone Database and your device's system clock. While we strive for accuracy, we cannot guarantee that times displayed are correct for all edge cases including recent timezone law changes, daylight saving transitions, or server clock drift. <strong className="text-white/90">Do not rely on this Service for mission-critical, legal, or medical time-sensitive decisions.</strong></p>
        <h4 className="text-white font-semibold mt-4">2. Weather Data</h4>
        <p>Weather forecasts are provided by the Open-Meteo API and are subject to their accuracy limitations. Weather is inherently unpredictable. Do not rely solely on our forecasts for safety-critical decisions.</p>
        <h4 className="text-white font-semibold mt-4">3. Historical & Trivia Content</h4>
        <p>"On This Day" facts and blog content are curated for entertainment and education. While we aim for accuracy, some historical details may be simplified. Always verify important historical claims with authoritative sources.</p>
        <h4 className="text-white font-semibold mt-4">4. External Links</h4>
        <p>Links to external websites are provided for convenience. We do not endorse, control, or take responsibility for the content of linked sites.</p>
        <h4 className="text-white font-semibold mt-4">5. Service Availability</h4>
        <p>We do not guarantee that the Service will be available at all times. We may perform maintenance, updates, or experience outages. We are not liable for any loss resulting from service unavailability.</p>
      </div>
    ),
  },
  {
    id: 'link-policy',
    icon: <FileText size={20} />,
    color: '#10b981',
    title: 'Link Policy',
    content: (
      <div className="space-y-4 text-white/70 text-sm leading-relaxed">
        <p><strong className="text-white">Effective date:</strong> {UPDATED}</p>
        <h4 className="text-white font-semibold mt-4">Linking To Our Site</h4>
        <p>You are welcome to link to {BRAND} from your website, blog, or social media. When linking:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Do not frame our content within your own website without permission</li>
          <li>Do not imply endorsement or partnership without our written consent</li>
          <li>Do not use our logo or branding without permission</li>
          <li>Links must not be from websites containing harmful, illegal, or offensive content</li>
        </ul>
        <h4 className="text-white font-semibold mt-4">Our Outbound Links</h4>
        <p>When we link to external sites, we do so for informational purposes. External links open in a new tab and include <code className="bg-white/10 px-1 rounded">rel="noopener noreferrer"</code> for security. We are not responsible for the content or privacy practices of external sites.</p>
        <h4 className="text-white font-semibold mt-4">Reporting Broken Links</h4>
        <p>If you find a broken link on our site, please report it to <a href={`mailto:${EMAIL}`} className="text-cyan-400 hover:underline">{EMAIL}</a> and we'll fix it promptly.</p>
      </div>
    ),
  },
  {
    id: 'donotsell',
    icon: <Ban size={20} />,
    color: '#f97316',
    title: 'Do Not Sell My Info',
    content: (
      <div className="space-y-4 text-white/70 text-sm leading-relaxed">
        <p><strong className="text-white">California Consumer Privacy Act (CCPA) Notice</strong></p>
        <p>Under the California Consumer Privacy Act (CCPA) and similar state privacy laws, California residents have the right to opt out of the "sale" of their personal information.</p>
        <h4 className="text-white font-semibold mt-4">What Data We Share</h4>
        <p>{BRAND} does not sell personal information in the traditional sense. However, the display of personalized advertisements by Google AdSense may constitute a "sale" under broad CCPA definitions, as it involves sharing browsing behavior with third parties for advertising purposes.</p>
        <h4 className="text-white font-semibold mt-4">How To Opt Out</h4>
        <p>To opt out of the sharing of your data for personalized advertising:</p>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>Visit <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google Ad Settings</a> and turn off ad personalization</li>
          <li>Use the <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">DAA Opt-Out Tool</a></li>
          <li>Enable "Do Not Track" in your browser settings (note: not all sites honor this signal)</li>
          <li>Use the Privacy Settings on this page to manage your preferences</li>
        </ol>
        <h4 className="text-white font-semibold mt-4">Your Other Rights</h4>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong className="text-white/90">Right to Know</strong> — what personal data we collect and how it's used</li>
          <li><strong className="text-white/90">Right to Delete</strong> — request deletion of your personal data</li>
          <li><strong className="text-white/90">Right to Non-Discrimination</strong> — we will not discriminate against you for exercising your rights</li>
        </ul>
        <p className="mt-4">To exercise any of these rights, contact us at <a href={`mailto:${EMAIL}`} className="text-cyan-400 hover:underline">{EMAIL}</a>.</p>
      </div>
    ),
  },
  {
    id: 'privacy-settings',
    icon: <Settings size={20} />,
    color: '#6366f1',
    title: 'Privacy Settings',
    content: <PrivacySettingsPanel />,
  },
];

function PrivacySettingsPanel() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('privacy-settings-v1');
      return saved ? JSON.parse(saved) : { analytics: true, personalizedAds: true, googleTranslate: true };
    } catch { return { analytics: true, personalizedAds: true, googleTranslate: true }; }
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key: string) => setSettings((s: typeof settings) => ({ ...s, [key]: !s[key] }));

  const save = () => {
    localStorage.setItem('privacy-settings-v1', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const items = [
    { key: 'analytics', label: 'Analytics Cookies', desc: 'Help us understand how visitors use the site (Vercel Analytics). Anonymous and aggregated.' },
    { key: 'personalizedAds', label: 'Personalized Advertising', desc: 'Allow Google AdSense to show ads based on your browsing interests. Turning off shows non-personalized ads.' },
    { key: 'googleTranslate', label: 'Google Translate', desc: 'Enable automatic page translation via Google Translate. Sends page content to Google servers.' },
  ];

  return (
    <div className="space-y-6">
      <p className="text-white/60 text-sm">Manage how {BRAND} uses your data. Your preferences are saved in your browser's localStorage.</p>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.key} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => toggle(item.key)}
              className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${settings[item.key] ? 'bg-cyan-500' : 'bg-white/20'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings[item.key] ? 'left-7' : 'left-1'}`} />
            </button>
            <div>
              <div className="text-white font-medium text-sm">{item.label}</div>
              <div className="text-white/50 text-xs mt-0.5">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Save Preferences
        </button>
        {saved && <span className="text-green-400 text-sm">✓ Saved successfully</span>}
      </div>
      <p className="text-white/30 text-xs">Note: Some of these settings require reloading the page to take full effect. Essential cookies necessary for site functionality cannot be disabled.</p>
    </div>
  );
}

export function LegalPage() {
  useSEO({
    title: 'Legal, Privacy & Terms | World Clock',
    description: 'World Clock legal information including Privacy Policy, Terms & Conditions, Advertising Policy, Disclaimer, Link Policy, Do Not Sell My Info, and Privacy Settings.',
    canonical: `${SITE}/legal`,
    noindex: false,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Legal — Privacy Policy, Terms & Advertising',
      'description': 'Privacy policy, terms of service, advertising policy, and disclaimer for World Clock.',
      'url': `${SITE}/legal`,
      'isPartOf': { '@type': 'WebSite', 'url': SITE, 'name': 'World Clock' },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home',  'item': SITE },
          { '@type': 'ListItem', 'position': 2, 'name': 'Legal', 'item': `${SITE}/legal` },
        ],
      },
    },
  });

  const [open, setOpen] = useState<string | null>('privacy');

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs mb-4">
            <Shield size={12} /> Legal Documents
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Legal & Privacy</h1>
          <p className="text-white/50 text-lg">Everything you need to know about how {BRAND} works, your rights, and our policies.</p>
          <p className="text-white/30 text-xs mt-2">Last updated: {UPDATED}</p>
        </div>

        <AdSlotComponent position="legal" index={0} className="mb-8" />

        {/* Accordion Sections */}
        <div className="space-y-3">
          {SECTIONS.map(section => (
            <div key={section.id} className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <button
                onClick={() => setOpen(open === section.id ? null : section.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: section.color + '22', color: section.color }}>
                    {section.icon}
                  </div>
                  <span className="text-white font-semibold">{section.title}</span>
                </div>
                <ChevronDown
                  size={18}
                  className="text-white/40 transition-transform"
                  style={{ transform: open === section.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              <AnimatePresence initial={false}>
                {open === section.id && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-6 border-t border-white/10 pt-4">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <AdSlotComponent position="legal" index={1} className="mt-8" />

        <div className="text-center mt-10 text-white/30 text-sm">
          Questions about any of these policies? Contact us at{' '}
          <a href={`mailto:${EMAIL}`} className="text-cyan-400 hover:underline">{EMAIL}</a>
        </div>
      </div>
    </div>
  );
}
