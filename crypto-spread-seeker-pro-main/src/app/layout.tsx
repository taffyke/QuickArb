import '@/styles/globals.css';
import { SupabaseProvider } from '@/contexts/supabase-context';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { CryptoProvider } from '@/contexts/crypto-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          <CryptoProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </CryptoProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
} 