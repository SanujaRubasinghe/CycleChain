"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// --- Eco Impact (added) ---
function EcoImpactCard({ totalDistanceKm = 0 }) {
  const km = Number(totalDistanceKm) || 0;
  const co2AvoidedKg = km * 0.21; // ~0.21 kg CO2 per km vs small car
  const calories = km * 35;       // ~35 kcal/km casual riding
  const treesEq = co2AvoidedKg / 22; // ~22 kg CO2 absorbed by a tree per year

  const Stat = ({ label, value, sub }) => (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="text-subtext text-sm">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {sub ? <div className="text-xs text-subtext mt-1">{sub}</div> : null}
    </div>
  );

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-4">Eco Impact</h2>
      <p className="text-sm text-subtext mb-4">
        Your riding helps cut emissions and keeps you healthy. 🌱
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Stat
          label="CO₂ Avoided"
          value={`${co2AvoidedKg.toFixed(1)} kg`}
          sub={`based on ${km.toFixed(1)} km`}
        />
        <Stat
          label="Calories Burned"
          value={`${Math.round(calories).toLocaleString()} kcal`}
          sub="estimated"
        />
        <Stat
          label="Trees Equivalent"
          value={`${treesEq.toFixed(2)}`}
          sub="annual absorption per tree"
        />
        <Stat
          label="Distance Ridden"
          value={`${km.toFixed(1)} km`}
          sub="lifetime total"
        />
      </div>

      <div className="mt-4 text-xs text-subtext/80">
        Estimates are indicative; actual impact varies by terrain, pace, and bike type.
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [profile, setProfile] = useState(null);
  const [rides, setRides] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const r = await fetch("/api/user", { cache: "no-store" });
      if (r.status === 401) { router.push("/login?callbackUrl=/user"); return; }
      if (!r.ok) throw new Error("Failed to load profile");
      const p = await r.json();
      setProfile(p);
      setUsername(p.username || "");
      const rr = await fetch("/api/user/rides", { cache: "no-store" }).catch(() => null);
      setRides(rr && rr.ok ? await rr.json() : []);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: password || undefined }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Update failed");
      }
      setPassword("");
      load();
      alert("Updated");
    } catch (e) {
      alert(e.message || "Update failed");
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Delete your account? This cannot be undone.")) return;
    const res = await fetch("/api/user", { method: "DELETE" });
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      alert("Failed to delete account");
    }
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-background to-surface p-8">Loading…</div>;
  if (err) return <div className="min-h-screen bg-gradient-to-br from-background to-surface p-8 text-red-400">{err}</div>;
  if (!profile) return null;

  const u = profile;
  const usage = profile.usage || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      <div className="container mx-auto px-4 py-10 grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">My Profile</h2>
          <div className="space-y-2 text-sm">
            <div><span className="text-subtext">Email:</span> {u.email}</div>
            <div><span className="text-subtext">Username:</span> {u.username}</div>
            <div><span className="text-subtext">Role:</span> {u.role}</div>
          </div>

          <form onSubmit={save} className="mt-6 space-y-4">
            <div>
              <label className="label">Username</label>
              <input className="input" value={username} onChange={(e)=>setUsername(e.target.value)} />
            </div>
            <div>
              <label className="label">New Password</label>
              <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Leave blank to keep current" />
            </div>
            <button className="btn btn-primary w-full">Save Changes</button>
          </form>

          <button className="btn btn-ghost w-full mt-3" onClick={deleteAccount}>Delete Account</button>
          <button className="btn btn-secondary w-full mt-3" onClick={logout}>Logout</button>
        </div>

        {/* Usage summary */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Usage</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface rounded-xl border border-border p-4">
              <div className="text-subtext text-sm">Total Rides</div>
              <div className="text-2xl font-semibold">{usage.totalRides || 0}</div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4">
              <div className="text-subtext text-sm">Distance (km)</div>
              <div className="text-2xl font-semibold">{usage.totalDistance?.toFixed?.(1) || 0}</div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4">
              <div className="text-subtext text-sm">Total Cost (LKR)</div>
              <div className="text-2xl font-semibold">{usage.totalCost || 0}</div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4">
              <div className="text-subtext text-sm">Last Ride</div>
              <div className="text-2xl font-semibold">
                {usage.lastRideAt ? new Date(usage.lastRideAt).toLocaleDateString() : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Eco Impact (added) */}
        <EcoImpactCard totalDistanceKm={usage.totalDistance || 0} />

        {/* Recent rides */}
        <div className="card p-6 lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Recent Rides</h2>
          {rides.length === 0 ? (
            <div className="text-subtext">No rides yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-subtext">
                  <tr>
                    <th className="text-left py-2">Bike</th>
                    <th className="text-left py-2">Start</th>
                    <th className="text-left py-2">End</th>
                    <th className="text-left py-2">Distance</th>
                    <th className="text-left py-2">Cost (LKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((r) => (
                    <tr key={r._id} className="border-t border-border/70">
                      <td className="py-2">{r.bikeId}</td>
                      <td className="py-2">{new Date(r.startTime).toLocaleString()}</td>
                      <td className="py-2">{new Date(r.endTime).toLocaleString()}</td>
                      <td className="py-2">{r.distanceKm} km</td>
                      <td className="py-2">{r.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
