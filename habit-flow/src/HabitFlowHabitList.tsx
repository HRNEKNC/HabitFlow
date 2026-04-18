// HabitFlowHabitList.tsx
import { useMemo } from "react";

export type Habit = {
  id: string;
  title: string;
  /** 0–7 gibi haftalık tekrar sayısı */
  streakWeeks?: number;
  /** Son tamamlanma etiketi (ör. "Bugün", "Dün") */
  lastDoneLabel?: string;
};

type Props = {
  habits: Habit[];
  title?: string;
  subtitle?: string;
  className?: string;
};

const ACCENTS = [
  "var(--hrn-accent-orange)",
  "var(--hrn-accent-blue)",
  "var(--hrn-accent-green)",
] as const;

export function HabitFlowHabitList({
  habits,
  title = "Habit Flow",
  subtitle = "Alışkanlıklarınız",
  className,
}: Props) {
  const safeHabits = useMemo(() => habits ?? [], [habits]);

  return (
    <section
      className={className}
      style={{
        // brand-guidelines + dark mode
        ["--hrn-bg" as any]: "#141413",
        ["--hrn-fg" as any]: "#faf9f5",
        ["--hrn-muted" as any]: "#b0aea5",
        ["--hrn-subtle" as any]: "#e8e6dc",
        ["--hrn-accent-orange" as any]: "#d97757",
        ["--hrn-accent-blue" as any]: "#6a9bcc",
        ["--hrn-accent-green" as any]: "#788c5d",
        ["--hrn-panel" as any]: "rgba(232, 230, 220, 0.06)",
        ["--hrn-border" as any]: "rgba(232, 230, 220, 0.12)",
        fontFamily: '"Lora", Georgia, serif',
        color: "var(--hrn-fg)",
        backgroundColor: "var(--hrn-bg)",
        borderRadius: 18,
        padding: "22px 22px 18px",
        maxWidth: 720,
        position: "relative",
        overflow: "hidden",
        boxShadow:
          "0 18px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Atmosphere: subtle mesh + grain (frontend-design) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -40,
          background:
            "radial-gradient(900px 420px at 18% 12%, rgba(106,155,204,0.18), transparent 60%)," +
            "radial-gradient(700px 380px at 82% 8%, rgba(217,119,87,0.16), transparent 55%)," +
            "radial-gradient(520px 420px at 60% 92%, rgba(120,140,93,0.14), transparent 60%)",
          filter: "saturate(1.05)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />

      <header style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontFamily: '"Poppins", Arial, sans-serif',
                fontWeight: 650,
                letterSpacing: "-0.02em",
                fontSize: 28,
                lineHeight: 1.15,
              }}
            >
              {title}
            </h2>
            <p
              style={{
                margin: "10px 0 0",
                color: "var(--hrn-muted)",
                fontSize: 15,
                lineHeight: 1.45,
              }}
            >
              {subtitle}
            </p>
          </div>

          <div
            style={{
              fontFamily: '"Poppins", Arial, sans-serif',
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--hrn-muted)",
              border: "1px solid var(--hrn-border)",
              background: "rgba(20,20,19,0.35)",
              backdropFilter: "blur(8px)",
              padding: "8px 10px",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            {safeHabits.length} alışkanlık
          </div>
        </div>
      </header>

      <ul
        style={{
          listStyle: "none",
          margin: "18px 0 0",
          padding: 0,
          display: "grid",
          gap: 10,
          position: "relative",
        }}
      >
        {safeHabits.length === 0 ? (
          <li
            style={{
              border: "1px dashed var(--hrn-border)",
              borderRadius: 14,
              padding: "16px 14px",
              color: "var(--hrn-muted)",
              background: "rgba(20,20,19,0.25)",
            }}
          >
            Henüz alışkanlık yok. İlk alışkanlığınızı ekleyerek akışı başlatın.
          </li>
        ) : (
          safeHabits.map((h, idx) => {
            const accent = ACCENTS[idx % ACCENTS.length];
            return (
              <li
                key={h.id}
                style={{
                  border: "1px solid var(--hrn-border)",
                  background:
                    "linear-gradient(180deg, rgba(232,230,220,0.07), rgba(232,230,220,0.03))",
                  borderRadius: 16,
                  padding: "14px 14px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  alignItems: "center",
                  transform: "translateZ(0)",
                  animation: `hrnIn 520ms cubic-bezier(.2,.8,.2,1) ${Math.min(idx, 10) * 45}ms both`,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: accent,
                        boxShadow: `0 0 0 6px color-mix(in oklab, ${accent} 22%, transparent)`,
                        flex: "0 0 auto",
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: '"Poppins", Arial, sans-serif',
                          fontWeight: 600,
                          fontSize: 16,
                          lineHeight: 1.25,
                          letterSpacing: "-0.01em",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={h.title}
                      >
                        {h.title}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          color: "var(--hrn-muted)",
                          fontSize: 13,
                          lineHeight: 1.35,
                        }}
                      >
                        {h.lastDoneLabel
                          ? `Son: ${h.lastDoneLabel}`
                          : "Son kayıt yok"}
                        {typeof h.streakWeeks === "number"
                          ? ` · ${h.streakWeeks} hafta üst üste`
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    style={{
                      fontFamily: '"Poppins", Arial, sans-serif',
                      fontSize: 13,
                      fontWeight: 600,
                      borderRadius: 12,
                      border:
                        "1px solid color-mix(in oklab, var(--hrn-fg) 18%, transparent)",
                      background: "rgba(20,20,19,0.35)",
                      color: "var(--hrn-fg)",
                      padding: "10px 12px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      // UI örneği: gerçek uygulamada tamamlama / detay aksiyonuna bağlanır
                      // eslint-disable-next-line no-console
                      console.log("habit:primary", h.id);
                    }}
                  >
                    İşaretle
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>

      <style>{`
        @keyframes hrnIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

// Örnek kullanım:
// <HabitFlowHabitList
//   habits={[
//     { id: "1", title: "Sabah meditasyonu", streakWeeks: 3, lastDoneLabel: "Bugün" },
//     { id: "2", title: "10.000 adım", streakWeeks: 1, lastDoneLabel: "Dün" },
//   ]}
// />
