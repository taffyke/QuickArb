import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MapPin, Phone, Send, CheckCircle } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data to a backend
    // For now, just simulate a successful submission
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Contact Us</CardTitle>
            <CardDescription>
              Have questions or need help? We're here to assist you.
            </CardDescription>
          </CardHeader>
          
          {submitted ? (
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Message Sent!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Thank you for contacting Crypto Spread Seeker Pro. We've received your message and will respond as soon as possible.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </Button>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="support">Technical Support</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                      <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="partnership">Partnership & Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Please describe your question or issue in detail..." 
                    rows={6}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full md:w-auto">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">support@cryptospreadseeker.com</p>
                  <p className="text-sm text-muted-foreground">business@cryptospreadseeker.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri, 9:00 AM - 5:00 PM EST</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Office</h3>
                  <p className="text-sm text-muted-foreground">
                    123 Blockchain Avenue<br />
                    Suite 420<br />
                    Crypto City, CC 10101
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Support Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Monday - Friday</span>
                <span className="text-sm font-medium">9:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Saturday</span>
                <span className="text-sm font-medium">10:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Sunday</span>
                <span className="text-sm font-medium">Closed</span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                All times are in Eastern Standard Time (EST). We strive to respond to all inquiries within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">What is cryptocurrency arbitrage?</h3>
            <p className="text-sm text-muted-foreground">
              Cryptocurrency arbitrage is the strategy of buying a cryptocurrency on one exchange and selling it on another 
              exchange at a higher price, profiting from the price difference between markets.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">How does your arbitrage scanning tool work?</h3>
            <p className="text-sm text-muted-foreground">
              Our tool continuously monitors price differences across 40+ exchanges in real-time, identifying profitable 
              arbitrage opportunities that exceed transaction costs and fees.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Do you offer API access for automated trading?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, we provide API access with our premium plans, allowing you to integrate our arbitrage data 
              with your own trading bots and systems.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Is my personal information secure?</h3>
            <p className="text-sm text-muted-foreground">
              We implement industry-standard security measures to protect your data. We never store your exchange API keys 
              on our servers, and all connections are encrypted using SSL/TLS.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 