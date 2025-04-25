import { useState } from 'react';
import { cn } from '@/lib/utils';
import { UserMenu } from './UserMenu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import Link from 'next/link';

const components: { title: string; href: string; description: string }[] = [
  {
    title: 'Dashboard',
    href: '/',
    description: 'Overview of your arbitrage opportunities and market data.',
  },
  {
    title: 'Market',
    href: '/market',
    description: 'Real-time market data across multiple exchanges.',
  },
  {
    title: 'Arbitrage Scanner',
    href: '/arbitrage',
    description: 'Find and monitor cross-exchange arbitrage opportunities.',
  },
  {
    title: 'Bot Settings',
    href: '/bot',
    description: 'Configure automation bots for automatic trading.',
  },
  {
    title: 'Exchange Manager',
    href: '/exchanges',
    description: 'Manage your exchanges and API keys securely.',
  },
  {
    title: 'Profile',
    href: '/profile',
    description: 'Manage your account settings and preferences.',
  },
];

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const [active, setActive] = useState('/');

  return (
    <div className="flex items-center justify-between w-full">
      <NavigationMenu className={cn('', className)} {...props}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Dashboard
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Features</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                    active={active === component.href}
                    onClick={() => setActive(component.href)}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/market" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Market
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/arbitrage" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Arbitrage
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      
      <UserMenu />
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & { active?: boolean }
>(({ className, title, children, active, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            active ? 'bg-accent text-accent-foreground' : '',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
}); 