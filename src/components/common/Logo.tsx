import React from 'react';

export interface LogoProps {
  /**
   * 'light' = optimized for light backgrounds (slate text + original emerald/charcoal AC logo)
   * 'dark' = optimized for dark backgrounds (white text + luminous emerald/white AC logo)
   * 'auto' = uses light mode styling by default
   */
  variant?: 'light' | 'dark' | 'auto';
  /**
   * Pre-set dimensions for standard layouts
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Whether to display the 'AgriConnect' text brand next to the mark
   */
  showText?: boolean;
  /**
   * Optional custom badge (e.g., 'Marketplace', 'Portal', 'Admin')
   */
  badge?: string;
  /**
   * Additional wrapper class names
   */
  className?: string;
  /**
   * Additional image class names
   */
  imgClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  showText = true,
  badge,
  className = '',
  imgClassName = '',
}) => {
  const isDark = variant === 'dark';

  // Size mapping for mark and text
  const sizeConfig = {
    xs: {
      img: 'h-6 w-auto',
      text: 'text-lg',
      badge: 'text-[9px] px-1.5 py-0.2',
    },
    sm: {
      img: 'h-8 w-auto',
      text: 'text-xl',
      badge: 'text-[9px] px-1.5 py-0.5',
    },
    md: {
      img: 'h-9 sm:h-10 w-auto',
      text: 'text-2xl',
      badge: 'text-[10px] px-2 py-0.5',
    },
    lg: {
      img: 'h-12 sm:h-14 w-auto',
      text: 'text-3xl',
      badge: 'text-xs px-2.5 py-0.5',
    },
    xl: {
      img: 'h-16 sm:h-20 w-auto',
      text: 'text-4xl sm:text-5xl',
      badge: 'text-xs px-3 py-1',
    },
  }[size];

  const logoSrc = isDark ? '/logo-dark-mode.png' : '/logo.png';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src={logoSrc}
        alt="AgriConnect Logo"
        className={`${sizeConfig.img} object-contain shrink-0 transition-transform duration-200 ${imgClassName}`}
        loading="eager"
      />

      {showText && (
        <div className="flex flex-col justify-center text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${sizeConfig.text} ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Agri<span className="text-emerald-600">Connect</span>
            </span>

            {badge && (
              <span
                className={`hidden sm:inline-block uppercase font-bold tracking-wider rounded-full border ${sizeConfig.badge} ${
                  isDark
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
