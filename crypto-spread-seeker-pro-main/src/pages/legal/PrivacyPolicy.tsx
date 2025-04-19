import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Privacy Policy</CardTitle>
          <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Crypto Spread Seeker Pro's Privacy Policy. This document outlines how we collect, use, and 
            protect your personal information when you use our service.
          </p>
          
          <h2>2. Information We Collect</h2>
          <p>
            We collect the following types of information:
          </p>
          <ul>
            <li><strong>Account Information:</strong> When you create an account, we collect your email address and password.</li>
            <li><strong>Usage Data:</strong> We collect information about how you interact with our application, including which features you use most frequently.</li>
            <li><strong>Device Information:</strong> We collect information about the device you use to access our service, including browser type, IP address, and operating system.</li>
          </ul>
          
          <h2>3. How We Use Your Information</h2>
          <p>
            We use your information for the following purposes:
          </p>
          <ul>
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information so that we can improve our service</li>
            <li>To monitor the usage of our service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
          
          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, 
            or destruction of your personal information. However, no method of transmission over the Internet or 
            method of electronic storage is 100% secure.
          </p>
          
          <h2>5. Third-Party Services</h2>
          <p>
            We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, 
            perform service-related tasks, or assist us in analyzing how our service is used. These third parties have access 
            to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it 
            for any other purpose.
          </p>
          
          <h2>6. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last updated" date at the top of this page.
          </p>
          
          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul>
            <li>Email: support@cryptospreadseeker.com</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 