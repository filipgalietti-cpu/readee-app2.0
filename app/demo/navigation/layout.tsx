import NavigationHarness from "./NavigationHarness";

export default function NavigationLayout({ children }: { children: React.ReactNode }) {
  return <NavigationHarness>{children}</NavigationHarness>;
}
