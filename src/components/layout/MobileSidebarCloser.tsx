
'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * A client component that automatically closes the mobile sidebar
 * whenever the pathname (URL) changes. This ensures a good
 * user experience on mobile devices by hiding the menu after navigation.
 */
export function MobileSidebarCloser() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, setOpenMobile]);

  return null; // This component does not render anything.
}
