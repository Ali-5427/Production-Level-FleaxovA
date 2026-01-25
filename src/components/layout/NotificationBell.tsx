

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getNotificationsListener, markNotificationAsRead } from '@/lib/firebase/firestore';
import type { Notification } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Mail, Package, Briefcase, FileText, CheckCircle, ArrowDownCircle, ShieldX, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';

const NOTIFICATION_ICONS: { [key: string]: React.ReactNode } = {
  new_message: <Mail className="h-4 w-4 text-blue-500" />,
  new_order: <Package className="h-4 w-4 text-green-500" />,
  new_application: <FileText className="h-4 w-4 text-purple-500" />,
  application_accepted: <CheckCircle className="h-4 w-4 text-green-500" />,
  application_rejected: <XCircle className="h-4 w-4 text-red-500" />,
  order_delivered: <Briefcase className="h-4 w-4 text-blue-500" />,
  order_completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  withdrawal_request: <ArrowDownCircle className="h-4 w-4 text-indigo-500" />,
  withdrawal_approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  withdrawal_rejected: <ShieldX className="h-4 w-4 text-red-500" />,
  default: <Bell className="h-4 w-4 text-gray-500" />,
};

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getNotificationsListener(user.uid, (newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.isRead).length);
    });

    return () => unsubscribe();
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
        {notifications.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">No new notifications</p>
        ) : (
          notifications.map(notif => (
            <DropdownMenuItem
              key={notif.id}
              className={`cursor-pointer flex items-start gap-3 p-3 ${!notif.isRead ? 'bg-accent/50' : ''}`}
              onClick={() => handleNotificationClick(notif)}
              style={{whiteSpace: 'normal', height: 'auto'}}
            >
                <div className="mt-1">{NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.default}</div>
                <div className="flex-1">
                    <p className="text-sm leading-snug">{notif.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : ''}
                    </p>
                </div>
            </DropdownMenuItem>
          ))
        )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
