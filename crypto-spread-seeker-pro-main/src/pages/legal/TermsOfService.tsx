import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Terms of Service</CardTitle>
          <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Crypto Spread Seeker Pro ("the Service"), you agree to be bound by these Terms of Service.
            If you disagree with any part of the terms, you do not have permission to access the Service.
          </p>
          
          <h2>2. Description of Service</h2>
          <p>
            Crypto Spread Seeker Pro is a cryptocurrency arbitrage and market analysis tool designed to help
            users identify potential trading opportunities across various cryptocurrency exchanges.
          </p>
          
          <h2>3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate, complete, and up-to-date information.
            You are responsible for safeguarding the password and for all activities that occur under your account.
            You agree to notify us immediately of any unauthorized use of your account.
          </p>
          
          <h2>4. Acceptable Use</h2>
          <p>
            You agree not to use the Service for any illegal purposes or to conduct any illegal activity, including,
            but not limited to, fraud, money laundering, or market manipulation.
          </p>
          <p>
            You agree not to:
          </p>
          <ul>
            <li>Use the Service in any way that could disable, overburden, damage, or impair the Service</li>
            <li>Attempt to gain unauthorized access to any parts of the Service</li>
            <li>Use any robot, spider, or other automatic device to access the Service</li>
            <li>Introduce any viruses, trojan horses, worms, or other harmful material</li>
          </ul>
          
          <h2>5. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by Crypto Spread Seeker Pro
            and are protected by international copyright, trademark, patent, trade secret, and other intellectual
            property or proprietary rights laws.
          </p>
          
          <h2>6. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason,
            including without limitation if you breach the Terms. Upon termination, your right to use the Service will
            immediately cease.
          </p>
          
          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall Crypto Spread Seeker Pro, nor its directors, employees, partners, agents, suppliers,
            or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including
            without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your
            access to or use of or inability to access or use the Service.
          </p>
          
          <h2>8. Disclaimer</h2>
          <p>
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis.
            The Service is provided without warranties of any kind, whether express or implied, including, but not limited
            to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
          </p>
          
          <h2>9. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws, without regard to its
            conflict of law provisions.
          </p>
          
          <h2>10. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing
            to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
          
          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <ul>
            <li>Email: support@cryptospreadseeker.com</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 