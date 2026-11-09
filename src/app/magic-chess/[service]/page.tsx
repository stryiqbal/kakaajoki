import { notFound } from "next/navigation";
import ServiceOrderPage from "@/features/services/ServiceOrderPage";
import { MAGIC_CHESS_SERVICES } from "@/features/services/service-catalog";

export function generateStaticParams() {
  return Object.keys(MAGIC_CHESS_SERVICES).map((service) => ({ service }));
}

export default async function MagicChessServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  const config = MAGIC_CHESS_SERVICES[service as keyof typeof MAGIC_CHESS_SERVICES];
  if (!config) notFound();

  return <ServiceOrderPage config={config} />;
}
