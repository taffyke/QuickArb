import React, { useState, useEffect, useCallback } from 'react';
import { ProfileService, ExchangeApiKey, ApiKeyRequest } from '../../services/ProfileService';
import { UserSessionManager } from '../../services/UserSessionManager';
import { Exchange } from '../../contexts/crypto-context';
import { ArbitrageService, ArbitrageStatus } from '../../services/ArbitrageService';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '../ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { 
  AlertCircle,
  CheckCircle2, 
  ChevronDown, 
  Copy, 
  Edit, 
  Key, 
  Loader2, 
  Lock,
  Plus, 
  RefreshCw, 
  Shield, 
  ShieldAlert, 
  Trash2, 
  XCircle,
  Info
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Session timeout component
const SessionTimeoutManager = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // seconds
  const inactivityTimeout = 15 * 60 * 1000; // 15 minutes
  const warningDuration = 60 * 1000; // 1 minute warning
  
  const resetTimeout = useCallback(() => {
    setShowWarning(false);
    setTimeRemaining(60);
    // Clear existing timeouts
    window.localStorage.setItem('lastActivity', Date.now().toString());
  }, []);
  
  // Check for inactivity
  useEffect(() => {
    const checkInactivity = () => {
      const lastActivity = parseInt(window.localStorage.getItem('lastActivity') || '0');
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      
      if (timeSinceLastActivity >= inactivityTimeout - warningDuration && !showWarning) {
        // Show warning
        setShowWarning(true);
      } else if (timeSinceLastActivity >= inactivityTimeout) {
        // Log out
        window.localStorage.removeItem('lastActivity');
        // In real app, redirect to logout endpoint
        window.location.href = '/logout';
      }
    };
    
    // Set initial last activity
    if (!window.localStorage.getItem('lastActivity')) {
      resetTimeout();
    }
    
    // Setup user activity listeners
    const onActivity = () => resetTimeout();
    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('click', onActivity);
    
    // Check every 5 seconds
    const intervalId = setInterval(checkInactivity, 5000);
    
    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('click', onActivity);
      clearInterval(intervalId);
    };
  }, [inactivityTimeout, warningDuration, resetTimeout, showWarning]);
  
  // Countdown timer
  useEffect(() => {
    if (showWarning && timeRemaining > 0) {
      const timerId = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
  }, [showWarning, timeRemaining]);
  
  if (!showWarning) return null;
  
  return (
    <Dialog open={showWarning} onOpenChange={(open) => !open && resetTimeout()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            Session Timeout Warning
          </DialogTitle>
          <DialogDescription>
            Your session will expire in {timeRemaining} seconds due to inactivity.
            Any unsaved API key changes will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            onClick={resetTimeout}
            variant="default"
          >
            Continue Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Password strength indicator component
const PasswordStrengthIndicator = ({ value }: { value: string }) => {
  // Skip for masked values
  if (!value || value.includes('*')) return null;
  
  let strength = 0;
  
  // Length check (minimum 12 chars is good)
  if (value.length >= 12) strength += 1;
  
  // Complexity checks
  if (/[A-Z]/.test(value)) strength += 1; // Has uppercase
  if (/[a-z]/.test(value)) strength += 1; // Has lowercase
  if (/[0-9]/.test(value)) strength += 1; // Has number
  if (/[^A-Za-z0-9]/.test(value)) strength += 1; // Has special char
  
  const getStrengthLabel = () => {
    if (strength <= 2) return { label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { label: 'Moderate', color: 'bg-amber-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };
  
  const { label, color } = getStrengthLabel();
  
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span>Strength: {label}</span>
      </div>
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-1 ${color} rounded-full`} 
          style={{ width: `${Math.min(100, (strength / 5) * 100)}%` }}
        />
      </div>
    </div>
  );
};

// Schema for API key form
const apiKeySchema = z.object({
  exchangeId: z.string({
    required_error: "Please select an exchange",
  }),
  label: z.string().min(1, {
    message: "Please enter a label for this API key",
  }),
  apiKey: z.string().min(10, {
    message: "API key is too short",
  }),
  secret: z.string().min(10, {
    message: "API secret is too short",
  }),
  passphrase: z.string().optional(),
  permissions: z.object({
    read: z.boolean().default(true),
    trade: z.boolean().default(false),
    withdraw: z.boolean().default(false),
  }),
});

// All supported exchanges
const supportedExchanges: Exchange[] = [
  'Binance', 'Bitget', 'Bybit', 'KuCoin', 'Gate.io', 'Bitmart',
  'Bitfinex', 'Gemini', 'Coinbase', 'Kraken', 'Poloniex', 'OKX',
  'AscendEX', 'Bittrue', 'HTX', 'MEXC'
];

// Exchange logos and detection patterns
const exchangeInfo: Record<Exchange, { 
  logo: string, 
  apiKeyPattern?: RegExp, 
  secretPattern?: RegExp,
  requiresPassphrase: boolean
}> = {
  'Binance': { 
    logo: '/logos/binance.png',
    apiKeyPattern: /^[a-zA-Z0-9]{64}$/,
    secretPattern: /^[a-zA-Z0-9]{64}$/,
    requiresPassphrase: false
  },
  'Coinbase': { 
    logo: '/logos/coinbase.png',
    apiKeyPattern: /^[a-zA-Z0-9]{32}$/,
    secretPattern: /^[a-zA-Z0-9\-_]{88}$/,
    requiresPassphrase: true
  },
  'Kraken': { 
    logo: '/logos/kraken.png',
    apiKeyPattern: /^[A-Z0-9]{56}$/,
    secretPattern: /^[A-Za-z0-9\/\+=]{88,108}$/,
    requiresPassphrase: false
  },
  'KuCoin': { 
    logo: '/logos/kucoin.png',
    apiKeyPattern: /^[a-f0-9]{24}$/,
    secretPattern: /^[a-zA-Z0-9\-]{36}$/,
    requiresPassphrase: true
  },
  'Bybit': { 
    logo: '/logos/bybit.png',
    apiKeyPattern: /^[a-zA-Z0-9]{18,24}$/,
    secretPattern: /^[a-zA-Z0-9]{36,64}$/,
    requiresPassphrase: false
  },
  'OKX': { 
    logo: '/logos/okx.png',
    apiKeyPattern: /^[a-zA-Z0-9\-]{32}$/,
    secretPattern: /^[A-Z0-9]{32}$/,
    requiresPassphrase: true
  },
  'Gate.io': { 
    logo: '/logos/gateio.png',
    apiKeyPattern: /^[a-zA-Z0-9]{32}$/,
    secretPattern: /^[a-zA-Z0-9]{32}$/,
    requiresPassphrase: false
  },
  'Bitget': { 
    logo: '/logos/bitget.png',
    apiKeyPattern: /^[a-zA-Z0-9]{32}$/,
    secretPattern: /^[a-zA-Z0-9]{32}$/,
    requiresPassphrase: false
  },
  'Bitmart': { 
    logo: '/logos/bitmart.png',
    requiresPassphrase: false
  },
  'Bitfinex': { 
    logo: '/logos/bitfinex.png',
    requiresPassphrase: false
  },
  'Gemini': { 
    logo: '/logos/gemini.png',
    requiresPassphrase: false
  },
  'Poloniex': { 
    logo: '/logos/poloniex.png',
    requiresPassphrase: false
  },
  'AscendEX': { 
    logo: '/logos/ascendex.png',
    requiresPassphrase: false
  },
  'Bittrue': { 
    logo: '/logos/bittrue.png',
    requiresPassphrase: false
  },
  'HTX': { 
    logo: '/logos/htx.png',
    requiresPassphrase: false
  },
  'MEXC': { 
    logo: '/logos/mexc.png',
    requiresPassphrase: false
  }
};

// Add this utility function at the top level of the file
const maskApiKey = (key: string): string => {
  if (!key) return '••••••••';
  if (key.includes('*')) return key; // Already masked
  
  // Show only last 4 characters
  const lastFour = key.slice(-4);
  const maskedPart = '•'.repeat(Math.max(6, key.length - 4));
  return `${maskedPart}${lastFour}`;
};

// Attempt to auto-detect exchange from API key format
const detectExchangeFromApiKey = (apiKey: string, secret: string): Exchange | null => {
  if (!apiKey || !secret) return null;
  
  for (const exchange of supportedExchanges) {
    const info = exchangeInfo[exchange];
    if (info.apiKeyPattern && info.secretPattern) {
      if (info.apiKeyPattern.test(apiKey) && info.secretPattern.test(secret)) {
        return exchange;
      }
    }
  }
  
  return null;
};

export function ApiKeyManager({ userId }: { userId: string }) {
  const [apiKeys, setApiKeys] = useState<ExchangeApiKey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [editKeyId, setEditKeyId] = useState<string | null>(null);
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [refreshingSession, setRefreshingSession] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rateLimitedUntil, setRateLimitedUntil] = useState<Record<string, number>>({});
  const [detectedExchange, setDetectedExchange] = useState<Exchange | null>(null);
  const [arbitrageStatus, setArbitrageStatus] = useState<ArbitrageStatus | null>(null);
  
  const profileService = ProfileService.getInstance();
  const userSessionManager = new UserSessionManager();
  const arbitrageService = ArbitrageService.getInstance();

  // Define form
  const form = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      label: "",
      apiKey: "",
      secret: "",
      passphrase: "",
      permissions: {
        read: true,
        trade: false,
        withdraw: false,
      },
    },
  });
  
  // Watch form values for exchange auto-detection
  const apiKeyValue = form.watch("apiKey");
  const secretValue = form.watch("secret");
  const selectedExchange = form.watch("exchangeId");
  
  // Auto-detect exchange from API key format
  useEffect(() => {
    if (apiKeyValue && secretValue && !selectedExchange && !editKeyId) {
      const detected = detectExchangeFromApiKey(apiKeyValue, secretValue);
      setDetectedExchange(detected);
      
      // Automatically select the detected exchange
      if (detected) {
        form.setValue("exchangeId", detected);
      }
    }
  }, [apiKeyValue, secretValue, selectedExchange, editKeyId, form]);
  
  // Update passphrase requirement based on selected exchange
  useEffect(() => {
    if (selectedExchange) {
      const exchange = selectedExchange as Exchange;
      const requiresPassphrase = exchangeInfo[exchange]?.requiresPassphrase || false;
      
      // Update passphrase field validation
      if (requiresPassphrase) {
        form.register("passphrase", { required: "Passphrase is required for this exchange" });
      } else {
        form.unregister("passphrase");
      }
    }
  }, [selectedExchange, form]);
  
  // Load API keys on component mount
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, fetch from backend
        // const response = await fetch(`/api/users/${userId}/api-keys`);
        // if (!response.ok) throw new Error('Failed to load API keys');
        // const data = await response.json();
        // setApiKeys(data);
        
        // For demo, get from profile service
        const profile = await profileService.getCurrentUserProfile();
        if (profile) {
          setApiKeys(profile.apiKeys || []);
          
          // Update arbitrage status
          const status = await arbitrageService.updateArbitrageStatus();
          setArbitrageStatus(status);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load API keys');
        console.error('Error loading API keys:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadApiKeys();
  }, [userId, profileService, arbitrageService]);
  
  // Update arbitrage status when API keys change
  useEffect(() => {
    const updateStatus = async () => {
      const status = await arbitrageService.updateArbitrageStatus();
      setArbitrageStatus(status);
    };
    
    updateStatus();
  }, [apiKeys, arbitrageService]);
  
  // Handle form submission for adding a new API key
  const onSubmit = async (data: z.infer<typeof apiKeySchema>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log("Form submitted with data:", {...data, secret: "[REDACTED]", passphrase: data.passphrase ? "[REDACTED]" : undefined});
      
      // Ensure permissions are properly defined
      const permissions = {
        read: true, // Always allow read
        trade: data.permissions?.trade === true,
        withdraw: data.permissions?.withdraw === true
      };
      
      // Create request object
      const request: ApiKeyRequest = {
        exchangeId: data.exchangeId as Exchange,
        apiKey: data.apiKey,
        secret: data.secret,
        passphrase: data.passphrase,
        label: data.label,
        permissions: permissions
      };
      
      // Add or update API key
      let newKey: ExchangeApiKey;
      
      try {
      if (editKeyId) {
        newKey = await profileService.updateApiKey(editKeyId, request);
        
        // Update local state
        setApiKeys(prev => 
          prev.map(key => key.id === editKeyId ? newKey : key)
        );
        
        setSuccessMessage(`API key for ${request.exchangeId} updated successfully`);
      } else {
        newKey = await profileService.addApiKey(request);
        
        // Update local state
        setApiKeys(prev => [...prev, newKey]);
        
        setSuccessMessage(`API key for ${request.exchangeId} added successfully`);
      }
      
      // Close dialog and reset form
      setShowAddDialog(false);
      form.reset();
      setEditKeyId(null);
      
      // Test the connection
      testApiKeyConnection(newKey.id);
      
      // Refresh adapters to use new keys
      refreshAdapters();
      } catch (apiError) {
        console.error('Error interacting with API:', apiError);
        setError(apiError instanceof Error ? apiError.message : 'Failed to save API key');
      
        // Keep dialog open so user can fix errors
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.error('Error in form submission:', err);
      setError(err instanceof Error ? err.message : 'Failed to save API key - please check your input');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Test API key connection
  const testApiKeyConnection = async (keyId: string) => {
    try {
      setTestingKeyId(keyId);
      setError(null);
      
      // Test connection
      await profileService.testApiKeyConnection(keyId);
      
      // Update local state
      const updatedProfile = await profileService.getCurrentUserProfile();
      if (updatedProfile) {
        setApiKeys(updatedProfile.apiKeys || []);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test connection');
      console.error('Error testing API key connection:', err);
    } finally {
      setTestingKeyId(null);
    }
  };
  
  // Delete API key
  const deleteApiKey = async (keyId: string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Delete key
      await profileService.deleteApiKey(keyId);
      
      // Update local state
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      
      setSuccessMessage('API key deleted successfully');
      setShowDeleteConfirm(null);
      
      // Refresh adapters
      refreshAdapters();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
      console.error('Error deleting API key:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Refresh exchange adapters
  const refreshAdapters = async () => {
    try {
      setRefreshingSession(true);
      await userSessionManager.refreshAllAdapters();
      
      // Update arbitrage status after refreshing adapters
      const status = await arbitrageService.updateArbitrageStatus();
      setArbitrageStatus(status);
      
    } catch (err) {
      console.error('Error refreshing adapters:', err);
    } finally {
      setRefreshingSession(false);
    }
  };
  
  // Helper for status badge
  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 ml-2">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="ml-2">
            <XCircle className="w-3 h-3 mr-1" />
            Invalid
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="ml-2">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Verifying
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="ml-2">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Verified
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Message for Arbitrage */}
      {arbitrageStatus && (
        <Alert className={`
          ${!arbitrageStatus.enabled ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}
          ${arbitrageStatus.exchangeCount === 1 ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
          ${arbitrageStatus.exchangeCount > 1 ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
        `}>
          <Info className="w-4 h-4" />
          <AlertTitle>Arbitrage Status</AlertTitle>
          <AlertDescription>
            {arbitrageStatus.reason || 'No arbitrage status available.'}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle2 className="w-4 h-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {/* API Keys List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary/70" />
            <span className="ml-2">Loading API keys...</span>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="bg-card/30 border border-border/60 rounded-lg p-6 text-center">
            <Key className="w-8 h-8 mx-auto mb-3 text-muted-foreground/60" />
            <h3 className="text-lg font-medium mb-1">No API Keys Added</h3>
            <p className="text-muted-foreground mb-4">
              Add your exchange API keys to enable arbitrage detection
            </p>
            <Button onClick={() => {
              setShowAddDialog(true);
              setError(null);
              setSuccessMessage(null);
              form.reset();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add API Key
            </Button>
          </div>
        ) : (
          // Display API keys
          apiKeys.map((key) => (
            <Card key={key.id} className={`transition-all duration-200 ${key.isActive ? '' : 'opacity-60'}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {key.label}
                      {getStatusBadge(key.testResultStatus)}
                    </CardTitle>
                    <CardDescription>{key.exchangeId}</CardDescription>
                  </div>
                  <div className="flex items-center">
                    <Switch
                      checked={key.isActive}
                      onCheckedChange={async (checked) => {
                        try {
                          setIsSubmitting(true);
                          // Create a properly typed request for updating the key status
                          // Call updateApiKeyStatus function from ProfileService (add it if needed)
                          await profileService.updateApiKeyStatus(key.id, checked);
                          
                          // Update local state with new active status
                          setApiKeys(prev => prev.map(k => 
                            k.id === key.id ? { ...k, isActive: checked } : k
                          ));
                          
                          // If we're disabling a key, we should refresh adapters
                          // If we're enabling a key, we should also refresh adapters
                          await refreshAdapters();
                          
                          setSuccessMessage(`API key ${checked ? 'enabled' : 'disabled'} successfully`);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed to update API key status');
                          console.error('Error updating API key status:', err);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      disabled={isSubmitting}
                      className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-input"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Key:</span>
                    <span className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
                      {maskApiKey(key.encryptedApiKey || '')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Permissions:</span>
                    <div className="flex gap-1">
                      {key.permissions?.read && (
                        <Badge variant="outline" className="text-xs">Read</Badge>
                      )}
                      {key.permissions?.trade && (
                        <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">Trade</Badge>
                      )}
                      {key.permissions?.withdraw && (
                        <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/20">Withdraw</Badge>
                      )}
                    </div>
                  </div>
                  
                  {key.testResultMessage && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <span className={`text-sm ${
                        key.testResultStatus === 'success' ? 'text-green-500' : 
                        key.testResultStatus === 'failed' ? 'text-red-500' : 'text-muted-foreground'
                      }`}>
                        {key.testResultMessage}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    disabled={testingKeyId === key.id || isSubmitting}
                    onClick={() => testApiKeyConnection(key.id)}
                  >
                    {testingKeyId === key.id ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Testing
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Test
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => {
                      setEditKeyId(key.id);
                      // Prefill form with existing data
                      form.setValue("exchangeId", key.exchangeId as string);
                      form.setValue("label", key.label);
                      // Don't prefill sensitive data
                      form.setValue("permissions", {
                        read: key.permissions?.read ?? true,
                        trade: key.permissions?.trade ?? false,
                        withdraw: key.permissions?.withdraw ?? false
                      });
                      setShowAddDialog(true);
                    }}
                    disabled={isSubmitting}
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setShowDeleteConfirm(key.id)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      {/* Add Button */}
      {apiKeys.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={() => {
            setShowAddDialog(true);
            setEditKeyId(null);
            form.reset();
            setError(null);
            setSuccessMessage(null);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add New API Key
          </Button>
        </div>
      )}
      
      {/* Add/Edit Dialog */}
      <Dialog 
        open={showAddDialog} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditKeyId(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editKeyId ? 'Edit API Key' : 'Add New API Key'}
            </DialogTitle>
            <DialogDescription>
              {editKeyId 
                ? 'Update your exchange API key details'
                : 'Enter your exchange API credentials to enable trading'
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Exchange Selection */}
              <FormField
                control={form.control}
                name="exchangeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exchange</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an exchange" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {supportedExchanges.map((exchange) => (
                          <SelectItem key={exchange} value={exchange}>
                            <div className="flex items-center">
                              <span>
                                {exchange}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {detectedExchange && !field.value && (
                        <span className="text-green-500">
                          We detected {detectedExchange} from your API key format
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Label */}
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Trading Bot, Main Account"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      A name to help you identify this API key
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* API Key */}
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your API key"
                        {...field}
                        disabled={isSubmitting || !!editKeyId}
                      />
                    </FormControl>
                    {editKeyId && (
                      <FormDescription>
                        API key cannot be edited, only replaced
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* API Secret */}
              <FormField
                control={form.control}
                name="secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Secret</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your API secret"
                        {...field}
                        disabled={isSubmitting || !!editKeyId}
                      />
                    </FormControl>
                    {editKeyId && (
                      <FormDescription>
                        Secret cannot be edited, only replaced
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* API Passphrase (for exchanges that require it) */}
              {(selectedExchange && exchangeInfo[selectedExchange as Exchange]?.requiresPassphrase) && (
                <FormField
                  control={form.control}
                  name="passphrase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Passphrase</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your API passphrase"
                          {...field}
                          value={field.value || ''}
                          disabled={isSubmitting || !!editKeyId}
                        />
                      </FormControl>
                      {editKeyId && (
                        <FormDescription>
                          Passphrase cannot be edited, only replaced
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Permissions */}
              <div className="space-y-4">
                <FormLabel>Permissions</FormLabel>
                
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="permissions.read"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="read-permission"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={true} // Always required
                        />
                        <Label htmlFor="read-permission" className="text-sm font-normal">
                          Read (required for market data)
                        </Label>
                      </div>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="permissions.trade"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="trade-permission"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="trade-permission" className="text-sm font-normal">
                          Trade (allows placing/canceling orders)
                        </Label>
                      </div>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="permissions.withdraw"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="withdraw-permission"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="withdraw-permission" className="text-sm font-normal text-destructive">
                          Withdraw (not recommended, allows withdrawing funds)
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowAddDialog(false);
                    form.reset();
                    setEditKeyId(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editKeyId ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>{editKeyId ? 'Update' : 'Add'} API Key</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this API key? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteConfirm && deleteApiKey(showDeleteConfirm)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete API Key</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Refresh Session Button */}
      {apiKeys.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={refreshAdapters}
            disabled={refreshingSession}
          >
            {refreshingSession ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Exchange Connections
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 