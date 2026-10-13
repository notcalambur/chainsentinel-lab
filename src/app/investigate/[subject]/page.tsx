import { InvestigationResult } from "@/components/InvestigationResult";

type Params = Promise<{ subject: string }>;

export default async function InvestigationPage({ params }: { params: Params }) {
  const { subject } = await params;
  return (
    <div className="space-y-4">
      <nav className="text-xs text-text-secondary">
        <a href="/" className="hover:text-text-primary underline">
          ← New investigation
        </a>
      </nav>
      <InvestigationResult subject={subject} />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Params }) {
  const { subject } = await params;
  return { title: `Investigation · ${subject.slice(0, 10)}…` };
}