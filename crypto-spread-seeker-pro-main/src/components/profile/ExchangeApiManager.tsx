import { useState, useEffect } from 'react';
import { useSupabase } from '@/contexts/supabase-context';
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
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';
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
import { validateApiKey, requiresPassphrase } from '../../utils/api-key-validator';

// All supported exchanges
const supportedExchanges = [
  'Binance', 'Bitget', 'Bybit', 'KuCoin', 'Gate.io', 'Bitmart',
  'Bitfinex', 'Gemini', 'Coinbase', 'Kraken', 'Poloniex', 'OKX',
  'AscendEX', 'Bittrue', 'HTX', 'MEXC'
];

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

// Function to mask API key for display
const maskApiKey = (key: string): string => {
  if (!key) return '';
  if (key.length <= 8) return '********';
  return key.substring(0, 4) + '****' + key.substring(key.length - 4);
};

// Function to detect which exchange an API key is for
const detectExchangeFromApiKey = (apiKey: string): string | null => {
  if (apiKey.length === 64) return 'Binance';
  if (apiKey.length === 32) return 'Coinbase';
  if (apiKey.length === 56 && /^[A-Z0-9]+$/.test(apiKey)) return 'Kraken';
  if (apiKey.startsWith('GD')) return 'Gate.io';
  if (apiKey.startsWith('BM')) return 'Bitmart';
  return null; // Unknown exchange
};

type ApiKey = {
  id: string;
  exchange: string;
  label: string;
  api_key: string;
  permissions: {
    read: boolean;
    trade: boolean;
    withdraw: boolean;
  };
  last_used?: string;
  status?: string;
  test_status?: string;
  test_message?: string;
};

export function ExchangeApiManager({ userId }: { userId: string }) {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      label: '',
      apiKey: '',
      secret: '',
      passphrase: '',
      permissions: {
        read: true,
        trade: false,
        withdraw: false,
      },
    },
  });

  // Load API keys from Supabase
  useEffect(() => {
    loadApiKeys();
  }, [userId]);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      
      // Always use demo data for localhost or demo users
      if (!userId || userId === 'demo-user' || window.location.hostname === 'localhost') {
        // For demo users, use mock data
        setApiKeys([
          {
            id: 'demo-1',
            exchange: 'Binance',
            label: 'Demo Account',
            api_key: 'DEMO_API_KEY_BINANCE',
            permissions: { read: true, trade: false, withdraw: false },
            last_used: 'Today',
            status: 'active'
          },
          {
            id: 'demo-2',
            exchange: 'Coinbase',
            label: 'Trading Bot',
            api_key: 'DEMO_API_KEY_COINBASE',
            permissions: { read: true, trade: true, withdraw: false },
            last_used: 'Yesterday',
            status: 'active'
          }
        ]);
        
        setLoading(false);
        return;
      }
      
      // Try to load from Supabase in production
      try {
        // Real users - fetch from Supabase
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .eq('user_id', userId);
        
        if (error) {
          throw error;
        }
        
        // Transform to ApiKey objects
        const transformedKeys = data.map(item => ({
          id: item.id,
          exchange: item.exchange,
          label: item.label,
          api_key: maskApiKey(item.encrypted_api_key || 'API_KEY'), // Display masked version
          permissions: item.permissions || { read: true, trade: false, withdraw: false },
          last_used: item.last_used ? new Date(item.last_used).toLocaleDateString() : 'Never',
          status: item.status || 'active',
          test_status: item.test_result_status || 'pending',
          test_message: item.test_result_message
        }));
        
        setApiKeys(transformedKeys);
      } catch (supabaseError) {
        console.error('Error loading API keys from Supabase:', supabaseError);
        
        // Fall back to demo data if Supabase fails
        toast({
          title: 'Using Demo Data',
          description: 'Could not connect to database. Using sample API keys.',
          variant: 'default',
        });
        
        setApiKeys([
          {
            id: 'demo-fallback-1',
            exchange: 'Binance',
            label: 'Demo Account (Fallback)',
            api_key: 'DEMO_API_KEY_BINANCE',
            permissions: { read: true, trade: false, withdraw: false },
            last_used: 'Today',
            status: 'active'
          }
        ]);
      }
    } catch (err) {
      console.error('Error in loadApiKeys:', err);
      
      // Ultimate fallback - empty state with helpful message
      toast({
        title: 'Demo Mode Activated',
        description: 'Using demo mode due to connection issues.',
        variant: 'default',
      });
      
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  // Form submit handler
  const onSubmit = async (data: z.infer<typeof apiKeySchema>) => {
    // For demo mode, just add the key to local state
    if (!userId || userId === 'demo-user' || window.location.hostname === 'localhost') {
      try {
        // Generate a fake ID
        const newKey: ApiKey = {
          id: `demo-${Date.now()}`,
          exchange: data.exchangeId,
          label: data.label,
          api_key: maskApiKey(data.apiKey),
          permissions: data.permissions,
          last_used: 'Never',
          status: 'active'
        };
        
        setApiKeys(prev => [...prev, newKey]);
        
        toast({
          title: 'API Key Added',
          description: 'Demo API key has been added successfully.',
          variant: 'default',
        });
        
        setIsAddKeyDialogOpen(false);
        form.reset();
      } catch (error) {
        console.error('Error adding demo API key:', error);
        toast({
          title: 'Error',
          description: 'Failed to add API key. Please try again.',
          variant: 'destructive',
        });
      }
      return;
    }
    
    // For real users, insert into Supabase
    try {
      const { error } = await supabase.from('api_keys').insert({
        user_id: userId,
        exchange: data.exchangeId,
        label: data.label,
        encrypted_api_key: data.apiKey, // Will be encrypted by DB trigger
        encrypted_secret: data.secret, // Will be encrypted by DB trigger
        encrypted_passphrase: data.passphrase || null,
        permissions: data.permissions,
        status: 'active'
      });
      
      if (error) throw error;
      
      // Reload API keys
      await loadApiKeys();
      
      toast({
        title: 'API Key Added',
        description: 'Your API key has been added successfully.',
        variant: 'default',
      });
      
      setIsAddKeyDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error adding API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to add API key. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Test API key connection
  const testApiKey = async (keyId: string) => {
    setTestingKey(keyId);
    
    try {
      // For demo mode, simulate a test
      if (!userId || userId === 'demo-user' || window.location.hostname === 'localhost') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update the key status locally
        setApiKeys(prev => prev.map(key => {
          if (key.id === keyId) {
            return {
              ...key,
              test_status: 'success',
              test_message: 'Connection successful (Demo)'
            };
          }
          return key;
        }));
        
        toast({
          title: 'API Key Tested',
          description: 'Demo API key test completed successfully.',
          variant: 'default',
        });
        
        setTestingKey(null);
        return;
      }
      
      // For real users, call the test endpoint
      const { data, error } = await supabase
        .rpc('test_api_key_connection', { key_id: keyId });
      
      if (error) throw error;
      
      // Update the key status
      await loadApiKeys();
      
      toast({
        title: 'API Key Tested',
        description: data.success 
          ? 'Connection test successful.' 
          : `Test failed: ${data.message}`,
        variant: data.success ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Error testing API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to test API key. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setTestingKey(null);
    }
  };

  // Handle exchange selection (update if passphrase is required)
  const handleExchangeChange = (value: string) => {
    form.setValue('exchangeId', value);
    
    // Check if passphrase is required for this exchange
    if (requiresPassphrase(value)) {
      form.register('passphrase', { required: true });
    } else {
      form.unregister('passphrase');
    }
  };

  // Delete API key
  const deleteApiKey = async (keyId: string) => {
    setDeletingKey(keyId);
    
    try {
      // For demo mode, just remove from local state
      if (!userId || userId === 'demo-user' || window.location.hostname === 'localhost') {
        setApiKeys(prev => prev.filter(key => key.id !== keyId));
        
        toast({
          title: 'API Key Deleted',
          description: 'Demo API key has been deleted.',
          variant: 'default',
        });
        
        setDeletingKey(null);
        return;
      }
      
      // For real users, delete from Supabase
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Reload API keys
      await loadApiKeys();
      
      toast({
        title: 'API Key Deleted',
        description: 'Your API key has been deleted successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete API key. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingKey(null);
    }
  };

  // Render status badge with appropriate color
  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500/15 text-green-600 hover:bg-green-500/20 border-green-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <XCircle className="mr-1 h-3 w-3" />
            Inactive
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-500/15 text-yellow-600 border-yellow-500/20">
            <RefreshCw className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Display appropriate UI
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium">Exchange API Keys</h3>
        <Dialog open={isAddKeyDialogOpen} onOpenChange={setIsAddKeyDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add API Key</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Exchange API Key</DialogTitle>
              <DialogDescription>
                Add your API key credentials securely to integrate with exchanges.
                Your keys are encrypted at rest.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="exchangeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange</FormLabel>
                      <Select onValueChange={handleExchangeChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an exchange" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {supportedExchanges.map((exchange) => (
                            <SelectItem key={exchange} value={exchange}>
                              {exchange}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder="My Trading Key" {...field} />
                      </FormControl>
                      <FormDescription>
                        A name to help you identify this key
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your API key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="secret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Secret</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your API secret" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('exchangeId') && requiresPassphrase(form.watch('exchangeId')) && (
                    <FormField
                      control={form.control}
                      name="passphrase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passphrase</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your passphrase" {...field} />
                          </FormControl>
                          <FormDescription>
                            Required for this exchange
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <FormLabel>Permissions</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name="permissions.read"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0 rounded-md border p-2">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              disabled // Read is always required
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer text-sm font-normal">
                            Read
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="permissions.trade"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0 rounded-md border p-2">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer text-sm font-normal">
                            Trade
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="permissions.withdraw"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0 rounded-md border p-2">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer text-sm font-normal">
                            Withdraw
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Alert variant="warning" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Security Best Practices</AlertTitle>
                  <AlertDescription>
                    Only enable the permissions you need. Create read-only keys when possible.
                  </AlertDescription>
                </Alert>
                
                <DialogFooter>
                  <Button type="submit">Save API Key</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : apiKeys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No API Keys Added</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                Add exchange API keys to enable automatic price fetching and trading.
                Your keys are encrypted and stored securely.
              </p>
              <Button 
                className="flex items-center gap-2"
                onClick={() => setIsAddKeyDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Add Your First API Key</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {apiKeys.map((key) => (
              <Card key={key.id} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>{key.label}</CardTitle>
                      {getStatusBadge(key.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => testApiKey(key.id)}
                              disabled={testingKey === key.id}
                            >
                              {testingKey === key.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Test connection</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => deleteApiKey(key.id)}
                              disabled={deletingKey === key.id}
                            >
                              {deletingKey === key.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete API key</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <CardDescription className="flex items-center mt-1">
                    <Badge variant="outline" className="mr-2 font-mono text-xs">
                      {key.exchange}
                    </Badge>
                    Last used: {key.last_used || 'Never'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">API Key</p>
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-muted px-1 py-0.5 text-sm font-mono">
                            {key.api_key}
                          </code>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Copy className="h-3.5 w-3.5" />
                                  <span className="sr-only">Copy</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Secret API Keys cannot be copied for security reasons</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {key.permissions.read && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/10">
                            Read
                          </Badge>
                        )}
                        {key.permissions.trade && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/10">
                            Trade
                          </Badge>
                        )}
                        {key.permissions.withdraw && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/10">
                            Withdraw
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {key.test_status && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Connection Test:</span>
                          {key.test_status === 'success' ? (
                            <span className="text-green-600 flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Success
                            </span>
                          ) : key.test_status === 'failed' ? (
                            <span className="text-red-600 flex items-center">
                              <XCircle className="h-4 w-4 mr-1" />
                              Failed
                            </span>
                          ) : (
                            <span className="text-yellow-600 flex items-center">
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Pending
                            </span>
                          )}
                        </div>
                        {key.test_message && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {key.test_message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
} 