import { notFound } from "next/navigation";
import ServiceOrderPage from "@/features/services/ServiceOrderPage";
import { MOBILE_LEGENDS_SERVICES } from "@/features/services/service-catalog";

export function generateStaticParams() {
  return Object.keys(MOBILE_LEGENDS_SERVICES).map((service) => ({ service }));
}

export default async function MobileLegendsServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  const config = MOBILE_LEGENDS_SERVICES[service as keyof typeof MOBILE_LEGENDS_SERVICES];
  if (!config) notFound();

  return <ServiceOrderPage config={config} />;
}
