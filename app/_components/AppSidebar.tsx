"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { useChildStore } from "@/lib/stores/child-store";
import { getChildAvatarImage } from "@/lib/utils/get-child-avatar";
import { usePlanStore } from "@/lib/stores/plan-store";
import { SidebarUserMenu } from "./SidebarUserMenu";
import { ShineBorder } from "@/app/components/magicui/shine-border";
import { FluentIcon, type FluentIconName } from "@/app/_components/FluentIcon";
import { Glyph, type GlyphName } from "@/app/_components/Glyph";
import { computeLevel } from "@/lib/levels/levels";
import { useLifetimeCarrots } from "@/lib/levels/use-lifetime-carrots";

/* ─── Nav items ──────────────────────────────────── */

type NavItem = {
  href: string;
  icon: GlyphName;
  label: string;
  /** Reward destinations render a Fluent Emoji instead of the Lucide glyph, so
   *  the "Fun" group reads as reward rather than admin. See CLAUDE.md. */
  fluent?: FluentIconName;
  iconColor?: string;
  emphasis?: boolean;
  shimmer?: boolean;
  /** Hide in the collapsed rail to keep the icon list short. */
  collapsedHidden?: boolean;
};
type NavSection = { label: string; items: NavItem[]; collapsible?: boolean; kidSize?: boolean };

function getNavSections(
  childId: string | null,
  capabilities: {
    ownsClassroom: boolean;
    hasChildren: boolean;
    hasAdminScope: boolean;
  },
  mode: "owner" | "tenant_admin" | "teacher" | "hybrid" | "parent" | "guest" = "guest",
): NavSection[] {
  const q = childId ? `?child=${childId}` : "";
  const sections: NavSection[] = [];
  const { ownsClassroom, hasChildren, hasAdminScope } = capabilities;

  // OWNER mode (Filip / Jen on platform-admin routes): admin-only nav.
  // Don't pollute with teacher/parent links — Filip can navigate back
  // out via the logo or by typing /classroom or /dashboard.
  if (mode === "owner") {
    sections.push({
      label: "Owner",
      items: [
        { href: "/owner", icon: "users", label: "All accounts" },
      ],
    });
    sections.push({
      label: "Content",
      items: [
        { href: "/owner/qc-bot", icon: "bot", label: "QC bot" },
        { href: "/owner/content-audit", icon: "scan", label: "Content audit" },
        { href: "/owner/batch-qc", icon: "factory", label: "Factory QC" },
      ],
    });
    sections.push({
      label: "Exit",
      items: [
        ownsClassroom
          ? { href: "/classroom", icon: "log-out", label: "Back to classroom" }
          : hasChildren
          ? { href: "/dashboard", icon: "log-out", label: "Back to family view" }
          : { href: "/", icon: "log-out", label: "Back to home" },
      ],
    });
    return sections;
  }

  // TENANT_ADMIN mode (school principal / district admin on their
  // own admin pages): admin nav only, scoped to their tenant.
  if (mode === "tenant_admin") {
    sections.push({
      label: "Admin",
      items: [
        { href: "/admin", icon: "building", label: "My scopes" },
        { href: "/admin/qc", icon: "shield-check", label: "Quiz QC queue" },
        { href: "/admin/community", icon: "users", label: "Community review" },
      ],
    });
    if (ownsClassroom) {
      sections.push({
        label: "Exit",
        items: [
          { href: "/classroom", icon: "graduation-cap", label: "Back to classroom" },
        ],
      });
    }
    return sections;
  }

  // Teacher capability → Teach / AI tools / Insights / Library / Grow.
  if (ownsClassroom) {
    // 4 groups: Teach (daily flow), AI tools, Insights, Library.
    // The collapsed rail shows ~1 icon per group so it doesn't read
    // as one long wall.
    sections.push({
      label: "Teach",
      items: [
        {
          href: "/classroom/build",
          icon: "sparkles",
          label: "Build with AI",
          emphasis: true,
          shimmer: true,
        },
        { href: "/classroom", icon: "graduation-cap", label: "Classroom" },
        { href: "/classroom/live", icon: "zap", label: "Live quiz", collapsedHidden: true },
      ],
    });

    sections.push({
      label: "AI tools",
      items: [
        {
          href: "/classroom/tools",
          icon: "brain",
          label: "Readee.ai tools",
          emphasis: true,
        },
        { href: "/luna", icon: "mic", label: "Luna" },
      ],
    });

    sections.push({
      label: "Insights",
      items: [
        { href: "/classroom/reports", icon: "bar-chart3", label: "Reports" },
        { href: "/fluency", icon: "mic", label: "Fluency check", collapsedHidden: true },
      ],
    });

    sections.push({
      label: "Library",
      items: [
        { href: "/classroom/library", icon: "library", label: "Library" },
        { href: "/classroom/lessons", icon: "book", label: "Lessons", collapsedHidden: true },
        { href: "/classroom/books", icon: "book-open", label: "Books", collapsedHidden: true },
        { href: "/classroom/leveled", icon: "layers", label: "Leveled passages", collapsedHidden: true },
        { href: "/classroom/authoring", icon: "clipboard-pen", label: "Quizzes", collapsedHidden: true },
      ],
    });

    sections.push({
      label: "Grow",
      collapsible: true,
      items: [
        { href: "/classroom/refer", icon: "users", label: "Refer a teacher", collapsedHidden: true },
      ],
    });

    if (hasAdminScope) {
      sections.push({
        label: "Admin",
        items: [
          { href: "/admin", icon: "building", label: "Admin" },
          { href: "/admin/qc", icon: "shield-check", label: "QC queue" },
          { href: "/admin/community", icon: "users", label: "Community review" },
        ],
      });
    }

  } // end ownsClassroom

  // Parent capability — single-purpose, ruthlessly trimmed.
  //
  // Before: one giant 14-item "Main" list mixing primary actions,
  // gamification, parent dashboards, and AI marketing. Filip flagged
  // "too much going on" — and he was right.
  //
  // After: three groups by intent, with the less-common surfaces
  // tucked into a collapsible "More" so they're discoverable but
  // don't dominate. Hybrid users (teacher + parent) keep the whole
  // block collapsed by default to keep teacher mode clean.
  if (hasChildren) {
    const collapseByDefault = ownsClassroom;

    sections.push({
      label: ownsClassroom ? "Family" : "Main",
      collapsible: collapseByDefault,
      kidSize: true,
      items: [
        { href: "/dashboard", icon: "home", label: ownsClassroom ? "Parent view" : "Dashboard" },
        { href: `/journey${q}`, icon: "map", label: "Journey" },
        { href: `/practice-hub${q}`, icon: "list-checks", label: "Practice" },
        { href: `/luna${q}`, icon: "mic", label: "Luna" },
        { href: `/luna/studio${q}`, icon: "pen-line", label: "Studio" },
        { href: `/practice-hub/community${q}`, icon: "book-open", label: "Library" },
      ],
    });

    sections.push({
      label: "Fun",
      collapsible: collapseByDefault,
      kidSize: true,
      items: [
        { href: "/daily", icon: "newspaper", label: "Daily Readee", fluent: "open-book" },
        { href: `/shop${q}`, icon: "carrot", label: "Shop", fluent: "carrot" },
        { href: `/leaderboard${q}`, icon: "trophy", label: "Leaderboard", fluent: "trophy" },
        // Long-tail surfaces now live on the /more page instead of a
        // cramped dropdown — one big, tappable entry point.
        { href: `/more${q}`, icon: "menu", label: "More" },
      ],
    });
  }

  // Admin (district / school admin scope) — top-level for both views.
  if (hasAdminScope && !ownsClassroom) {
    // Pure admins (no classroom) get the admin shortcuts here. For
    // teacher-with-admin we already added the Admin section in the
    // teacher block above.
    sections.push({
      label: "Admin",
      items: [
        { href: "/admin", icon: "building", label: "Admin" },
        { href: "/admin/community", icon: "users", label: "Community review" },
      ],
    });
  }

  return sections;
}

/* ─── Helpers ────────────────────────────────────── */

function isActive(pathname: string, href: string) {
  return pathname === href.split("?")[0];
}

function navLinkClass(pathname: string, href: string, emphasis?: boolean, shimmer?: boolean, kidSize?: boolean) {
  // Shimmering AI entries: violet→indigo→pink gradient face + ShineBorder
  // rainbow trim. NOT the canonical Magic UI RainbowButton, which has a
  // near-black inner face by design — that read as "black button" rather
  // than "AI button" for us. ShineBorder gets layered in by the render.
  if (shimmer) {
    return "relative overflow-hidden flex w-full items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-2 text-[13px] font-bold text-white shadow-sm transition hover:brightness-110";
  }
  // Kid-size rows (family view): chunky, finger-friendly tap targets.
  const size = kidSize
    ? "gap-3 px-3 py-3 rounded-2xl text-[15px]"
    : "gap-2.5 px-2 py-1.5 rounded-lg text-[13px]";
  if (emphasis && !isActive(pathname, href)) {
    return `flex items-center ${size} font-semibold transition-colors bg-violet-50 text-violet-700 hover:bg-violet-100`;
  }
  return `flex items-center ${size} transition-colors ${
    isActive(pathname, href)
      ? `bg-violet-50 text-violet-700 ${kidSize ? "font-bold" : "font-medium"}`
      : `text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 ${kidSize ? "font-semibold" : ""}`
  }`;
}

function navIconClass(pathname: string, href: string, kidSize?: boolean) {
  // Inactive icons sit in the brand palette (violet-300) instead of
  // generic zinc grey — keeps hierarchy with active (violet-500) but
  // makes the whole sidebar read as "Readee" instead of "SaaS dashboard."
  const dim = kidSize ? "w-6 h-6" : "w-4 h-4";
  return `${dim} ${isActive(pathname, href) ? "text-violet-700" : "text-violet-500"}`;
}

/* ═══════════════════════════════════════════════════ */
/*  AppSidebar                                         */
/* ═══════════════════════════════════════════════════ */

export default function AppSidebar({ mobileOnly = false }: { mobileOnly?: boolean }) {
  const pathname = usePathname();
  // Collapse removed — the desktop sidebar is always open. Kids need the
  // labels, and the collapse toggle caused more layout pain than value.
  const open = true;
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);

  const childData = useChildStore((s) => s.childData);
  const storeChildren = useChildStore((s) => s.children);
  const activeChild = childData || storeChildren[0] || null;
  const childIndex = activeChild ? storeChildren.indexOf(activeChild) : 0;
  const avatarSrc = activeChild ? getChildAvatarImage(activeChild, childIndex === -1 ? 0 : childIndex) : null;

  const plan = usePlanStore((s) => s.rawPlan);
  const hasAdminScope = usePlanStore((s) => s.hasAdminScope);
  const ownsClassroom = usePlanStore((s) => s.ownsClassroom);
  const planHasChildren = usePlanStore((s) => s.hasChildren);
  const displayName = usePlanStore((s) => s.displayName);
  const email = usePlanStore((s) => s.email);
  const fetchPlan = usePlanStore((s) => s.fetch);
  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  // children may live in the dedicated store; also fall back to the plan
  // store flag for first-render (when child list hasn't loaded yet).
  const hasChildren = storeChildren.length > 0 || planHasChildren;

  // Platform admin routes ALWAYS render with the owner's actual
  // identity, ignoring whatever child/parent persona happens to be
  // in the client stores. Avoids the leak that happens when an admin
  // also has a child profile under a +alias email — the previous
  // session's kid avatar would otherwise bleed into admin pages.
  const isPlatformAdminRoute = pathname?.startsWith("/owner");
  const isTenantAdminRoute =
    !isPlatformAdminRoute &&
    (pathname?.startsWith("/admin/school") || pathname?.startsWith("/admin/district") || pathname?.startsWith("/admin/qc") || pathname === "/admin");

  // Parent surfaces — B2C-only per the May 4 reshape. When the user is
  // physically on one of these routes we force parent identity even if
  // they happen to also own a classroom (hybrid hangover from B2B
  // experiments). Prevents the teacher sidebar from leaking onto
  // /practice-hub, /dashboard, /buddy etc.
  const PARENT_SURFACE_PREFIXES = [
    "/dashboard",
    "/practice-hub",
    "/practice",
    "/luna",
    "/journey",
    "/stories",
    "/discover",
    "/learn",
    "/lesson",
    "/today",
    "/levels",
    "/upgrade",
    "/assessment",
    "/settings",
    "/fluency",
    "/analytics",
    "/leaderboard",
    "/learning-report",
  ];
  const isParentSurface =
    !!pathname &&
    PARENT_SURFACE_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?"),
    );

  // Account mode — single source of truth for sidebar visual variant.
  // Drives both the colored mode badge and the avatar styling so the
  // sidebar always tells the user which "hat" they're wearing.
  type AccountMode = "owner" | "tenant_admin" | "teacher" | "hybrid" | "parent" | "guest";
  const accountMode: AccountMode = isPlatformAdminRoute
    ? "owner"
    : isTenantAdminRoute && hasAdminScope
    ? "tenant_admin"
    : isParentSurface && hasChildren
    ? "parent"
    : ownsClassroom && hasChildren
    ? "hybrid"
    : ownsClassroom
    ? "teacher"
    : hasChildren
    ? "parent"
    : "guest";

  // Sidebar identity derives from capability. Teachers see their own
  // name; pure parents see the child-forward identity. Hybrid users
  // (both capabilities) see the teacher identity in the header — the
  // Family group still gives them parent-side links right below.
  // Platform admin routes override everything → owner identity.
  // Parent surfaces force the kid-forward identity regardless of
  // classroom ownership.
  const showTeacherIdentity =
    isPlatformAdminRoute || (ownsClassroom && !isParentSurface);
  const sidebarName = isPlatformAdminRoute
    ? displayName || "Owner"
    : showTeacherIdentity
    ? displayName || "Teacher"
    : activeChild?.first_name || displayName || "Reader";
  const sidebarAvatarSrc = isPlatformAdminRoute ? null : showTeacherIdentity ? null : avatarSrc;
  const sidebarSubtitle = isPlatformAdminRoute
    ? "Readee Inc · Owner"
    : isTenantAdminRoute && hasAdminScope
    ? "School / District Admin"
    : showTeacherIdentity
    ? hasChildren
      ? "Teacher · Parent"
      : hasAdminScope
      ? "Teacher · Admin"
      : "Teacher"
    : null;
  const sidebarDetail = isPlatformAdminRoute || showTeacherIdentity ? email ?? null : null;

  // Reader level next to the child's name. Only on the child/parent identity —
  // an owner or teacher header has no reader level to show.
  const { lifetimeCarrots } = useLifetimeCarrots(
    isPlatformAdminRoute || showTeacherIdentity ? null : activeChild?.id || null,
  );
  const showLevel = !isPlatformAdminRoute && !showTeacherIdentity && !!activeChild;

  const sections = getNavSections(
    activeChild?.id || null,
    { ownsClassroom, hasChildren, hasAdminScope },
    accountMode,
  );

  // Close mobile overlay on route change
  useEffect(() => { setMobileOpen(false); }, [pathname, setMobileOpen]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="absolute top-0 left-0 bottom-0 w-[272px] bg-white shadow-2xl overflow-hidden border-r border-zinc-200"
            >
              <ExpandedNav
                pathname={pathname}
                sections={sections}
                avatarSrc={sidebarAvatarSrc}
                sidebarName={sidebarName}
                plan={plan || "free"}
                subtitle={sidebarSubtitle}
                detail={sidebarDetail}
                lifetimeCarrots={showLevel ? lifetimeCarrots : null}
                showCreditIndicator={ownsClassroom}
                onClose={() => setMobileOpen(false)}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── Desktop fixed sidebar — always open (collapse removed) ── */}
      {!mobileOnly && <aside
        className="hidden lg:flex flex-col fixed top-[76px] left-0 bottom-0 z-30 w-[272px] bg-white border-r border-zinc-200"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <ExpandedNav
              pathname={pathname}
              sections={sections}
              avatarSrc={sidebarAvatarSrc}
              sidebarName={sidebarName}
              plan={plan || "free"}
              subtitle={sidebarSubtitle}
              detail={sidebarDetail}
              lifetimeCarrots={showLevel ? lifetimeCarrots : null}
              showCreditIndicator={ownsClassroom}
            />
          </div>
        </div>
      </aside>}
    </>
  );
}

/* ─── NavSectionBlock — renders one section, collapsible when flagged ── */

function NavSectionBlock({
  section,
  pathname,
  onClose,
}: {
  section: NavSection;
  pathname: string;
  onClose?: () => void;
}) {
  const childHrefs = section.items.map((i) => i.href.split("?")[0]);
  const containsActive = childHrefs.some((h) => pathname === h);
  const kid = section.kidSize;
  const navSpacing = kid ? "space-y-1.5" : "space-y-0.5";
  // Start expanded if user is currently on a route inside this section.
  const [open, setOpen] = useState(
    !section.collapsible || containsActive,
  );

  if (!section.collapsible) {
    return (
      <div className="px-3">
        <p className="px-2 mb-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
          {section.label}
        </p>
        <nav className={navSpacing}>
          {section.items.map(({ href, icon: Icon, label: itemLabel, fluent, iconColor, emphasis, shimmer }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={navLinkClass(pathname, href, emphasis, shimmer, kid)}
            >
              {shimmer && (
                <ShineBorder
                  borderWidth={1.5}
                  duration={5}
                  shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                />
              )}
              {fluent ? (
                <FluentIcon name={fluent} size={kid ? 24 : 20} className="relative z-10 flex-shrink-0" />
              ) : (
                <Glyph
                  name={Icon}
                  size={kid ? 24 : 16}
                  className={
                    shimmer
                      ? "relative z-10 text-white drop-shadow-sm"
                      : emphasis && !isActive(pathname, href)
                        ? "text-violet-500"
                        : iconColor
                          ? iconColor
                          : navIconClass(pathname, href, kid)
                  }
                />
              )}
              <span className={shimmer ? "relative z-10" : undefined}>{itemLabel}</span>
            </Link>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="px-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1 px-2 mb-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest hover:text-zinc-600"
        aria-expanded={open}
      >
        <Glyph name="chevron-right" size={12} className={`transition-transform ${open ? "rotate-90" : ""}`} />
        {section.label}
      </button>
      {open && (
        <nav className={navSpacing}>
          {section.items.map(({ href, icon: Icon, label: itemLabel, iconColor, emphasis, shimmer }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={navLinkClass(pathname, href, emphasis, shimmer, kid)}
            >
              {shimmer && (
                <ShineBorder
                  borderWidth={1.5}
                  duration={5}
                  shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                />
              )}
              <Glyph
                name={Icon}
                size={kid ? 24 : 16}
                className={
                  shimmer
                    ? "relative z-10 text-white drop-shadow-sm"
                    : emphasis && !isActive(pathname, href)
                      ? "text-violet-500"
                      : iconColor
                        ? iconColor
                        : navIconClass(pathname, href, kid)
                }
              />
              <span className={shimmer ? "relative z-10" : undefined}>{itemLabel}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

/* ─── Expanded nav content (shared by mobile + desktop) ── */

/**
 * The child's reader level: a rounded-square tile in the level's own gradient
 * carrying the level's icon — the same shape the dashboard card uses, so the
 * two read as one object. Sits at the trailing edge of the sidebar header,
 * filling the space the name row already left empty. The avatar stays the
 * avatar, in its own slot.
 */
function LevelTile({ lifetimeCarrots }: { lifetimeCarrots: number }) {
  const { current } = computeLevel(lifetimeCarrots);
  return (
    <div
      className="w-9 h-[18px] rounded-md flex items-center justify-center gap-[3px]"
      style={{ background: `linear-gradient(135deg,${current.accent.hexDeep},${current.accent.hex})` }}
      title={`Level ${current.number} - ${current.name}`}
    >
      <FluentIcon name={current.icon} size={11} />
      <span className="text-[10px] font-extrabold text-white leading-none">{current.number}</span>
    </div>
  );
}

function ExpandedNav({
  pathname,
  sections,
  avatarSrc,
  sidebarName,
  plan,
  subtitle,
  detail,
  lifetimeCarrots,
  showCreditIndicator,
  onClose,
  onToggle,
}: {
  pathname: string;
  sections: ReturnType<typeof getNavSections>;
  avatarSrc: string | null;
  sidebarName: string;
  plan: string;
  subtitle?: string | null;
  /** Child's lifetime carrots, or null to hide the reader-level badge. */
  lifetimeCarrots?: number | null;
  detail?: string | null;
  showCreditIndicator?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}) {
  const dismiss = onClose || onToggle;

  const initials = sidebarName
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex items-center gap-2.5">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          {avatarSrc ? (
            <div className="w-9 h-9 rounded-lg overflow-hidden ring-1 ring-zinc-200">
              <img src={avatarSrc} alt={sidebarName} className="w-full h-full object-cover" draggable={false} />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-600 to-violet-500 text-xs font-bold text-white ring-1 ring-violet-200">
              {initials}
            </div>
          )}
          {typeof lifetimeCarrots === "number" && (
            <LevelTile lifetimeCarrots={lifetimeCarrots} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-zinc-900 truncate leading-tight">
            {sidebarName}
          </div>
          {subtitle && (
            <div className="text-[11px] text-zinc-400 truncate leading-tight">
              {subtitle}
            </div>
          )}
        </div>
        {dismiss && (
          <button
            onClick={dismiss}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-zinc-100 transition-colors"
            aria-label="Collapse"
          >
            <Glyph name="chevron-down" size={16} className="text-zinc-400 -rotate-90" />
          </button>
        )}
      </div>

      <div className="mx-3 h-px bg-zinc-200" />

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto py-2 space-y-4">
        {sections.map((section) => (
          <NavSectionBlock
            key={section.label}
            section={section}
            pathname={pathname}
            onClose={onClose}
          />
        ))}
      </div>

      {/* Account menu */}
      <div className="mx-3 h-px bg-zinc-200" />
      <SidebarUserMenu
        avatarSrc={avatarSrc}
        name={sidebarName}
        plan={plan}
        subtitle={subtitle}
        detail={detail ?? undefined}
        showCreditIndicator={!!showCreditIndicator}
      />
    </div>
  );
}
