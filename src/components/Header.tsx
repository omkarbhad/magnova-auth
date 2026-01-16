import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserMenu } from '@/components/auth/UserMenu';

interface HeaderProps {
  activeView: 'kundali' | 'matcher';
  onViewChange: (view: 'kundali' | 'matcher') => void;
}

export function Header({
  activeView,
  onViewChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800/50 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <img 
              src="/astrova_logo.png" 
              alt="Astrova Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
                Astrova
              </h1>
              <p className="text-[10px] sm:text-xs text-neutral-400 leading-tight">
                Vedic Birth Chart Generator
              </p>
            </div>
            <h1 className="sm:hidden text-sm font-bold text-white">Astrova</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Navigation Tabs */}
            <Tabs
              value={activeView}
              onValueChange={(v) => onViewChange(v as 'kundali' | 'matcher')}
              className="hidden sm:block"
            >
              <TabsList>
                <TabsTrigger value="kundali" className="gap-1.5">
                  <img 
                    src="/astrova_logo.png" 
                    alt="Astrova" 
                    className="w-4 h-4"
                  />
                  Astrova Charts
                </TabsTrigger>
                <TabsTrigger value="matcher" className="gap-1.5">
                  <img 
                    src="/heart_logo.png" 
                    alt="Kundali Matcher" 
                    className="w-4 h-4"
                  />
                  Kundali Matcher
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Mobile Navigation */}
            <Tabs
              value={activeView}
              onValueChange={(v) => onViewChange(v as 'kundali' | 'matcher')}
              className="sm:hidden"
            >
              <TabsList>
                <TabsTrigger value="kundali" className="px-2">
                  <img 
                    src="/astrova_logo.png" 
                    alt="Astrova" 
                    className="w-5 h-5 sm:w-4 sm:h-4"
                  />
                </TabsTrigger>
                <TabsTrigger value="matcher" className="px-2">
                  <img 
                    src="/heart_logo.png" 
                    alt="Kundali Matcher" 
                    className="w-5 h-5 sm:w-4 sm:h-4"
                  />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
