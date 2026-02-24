import TosGate from "@/app/_components/TosGate";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TosGate>{children}</TosGate>;
}
