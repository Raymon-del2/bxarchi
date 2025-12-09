"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, collection, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface UnreadCtx {
  hasUnreadDev: boolean;
  markDevRead: () => Promise<void>;
}

const Ctx = createContext<UnreadCtx>({ hasUnreadDev: false, markDevRead: async () => {} });

export function UnreadProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [hasUnreadDev, setHasUnreadDev] = useState(false);
  const [lastRead, setLastRead] = useState<number>(0);

  // Load lastReadAt and attach listener
  useEffect(() => {
    if (!user) return;

    const userMetaRef = doc(db, 'userMeta', user.uid, 'devInsights', 'meta');

    (async () => {
      const snap = await getDoc(userMetaRef);
      if (snap.exists()) {
        setLastRead(snap.data().lastReadAt?.toMillis?.() || 0);
      }
    })();

    const latestQ = query(collection(db, 'devInsights'), orderBy('timestamp', 'desc'), limit(1));
    const unsub = onSnapshot(latestQ, (s) => {
      if (s.empty) return;
      const data = s.docs[0].data();
      const ts = data.timestamp?.toMillis?.() || 0;
      const senderId = data.userId;
      if (senderId !== user.uid && ts > lastRead) {
        setHasUnreadDev(true);
      }
    });
    return () => unsub();
  }, [user, lastRead]);

  const markDevRead = async () => {
    if (!user) return;
    setHasUnreadDev(false);
    setLastRead(Date.now());
    const userMetaRef = doc(db, 'userMeta', user.uid, 'devInsights', 'meta');
    await setDoc(userMetaRef, { lastReadAt: serverTimestamp() }, { merge: true });
  };

  return <Ctx.Provider value={{ hasUnreadDev, markDevRead }}>{children}</Ctx.Provider>;
}

export const useUnread = () => useContext(Ctx);
