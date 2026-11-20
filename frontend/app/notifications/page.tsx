"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import RoleGuard from "../../components/RoleGuard";
import { supabase } from "../../lib/supabase";

type Notification = { id: string; message: string; status: string; created_at: string };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    async function loadNotifications() {
      if (!supabase) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return;
      const { data } = await supabase.from("notifications").select("id,message,status,created_at").eq("profile_id", userId).order("created_at", { ascending: false });
      setNotifications((data ?? []) as Notification[]);
      const unreadIds = (data ?? []).filter((item) => item.status === "UNREAD").map((item) => item.id);
      if (unreadIds.length) {
        await supabase.from("notifications").update({ status: "READ" }).in("id", unreadIds);
      }

      channel = supabase
        .channel(`notifications-${userId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `profile_id=eq.${userId}` }, (payload) => {
          const notification = payload.new as Notification;
          setNotifications((current) => [notification, ...current]);
        })
        .subscribe();
    }
    loadNotifications();
    return () => {
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <RoleGuard allowedRoles={["DRIVER", "PARKING_ATTENDANT", "PARKING_ADMINISTRATOR", "SYSTEM_ADMINISTRATOR"]}>
      <main style={{ minHeight: "100vh", background: "#f4f7fa", padding: 24 }}>
        <div style={{ maxWidth: 700, margin: "auto" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 7, color: "#66758a", fontSize: 13, marginBottom: 12 }}><ArrowLeft size={15} /> Dashboard</Link>
          <section style={{ background: "white", border: "1px solid #e7edf4", borderRadius: 14, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}><Bell color="#176b87" /><h1 style={{ margin: 0 }}>Notifications</h1></div>
            {notifications.length === 0 ? <p style={{ color: "#66758a" }}>No notifications.</p> : notifications.map((notification) => (
              <article key={notification.id} style={{ borderBottom: "1px solid #edf1f5", padding: "12px 0" }}>
                <strong style={{ display: "block", fontSize: 13 }}>{notification.message}</strong>
                <small style={{ color: "#66758a" }}>{new Date(notification.created_at).toLocaleString()}</small>
              </article>
            ))}
          </section>
        </div>
      </main>
    </RoleGuard>
  );
}
