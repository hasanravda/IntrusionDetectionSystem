import { Activity, BrainCircuit, Database, FileScan, Radar, ShieldCheck, Workflow } from 'lucide-react';

const pipelineSteps = [
  {
    id: '01',
    title: 'Packet Capture',
    description:
      'The backend captures live packets from your selected network interface and writes a short-time PCAP snapshot for controlled analysis.',
    icon: Radar,
    accent: 'from-sky-400/25 to-cyan-400/10 border-sky-400/40',
  },
  {
    id: '02',
    title: 'Flow Generation',
    description:
      'Packets are converted into bidirectional network flows with timing, protocol, port, and byte/packet statistics.',
    icon: Workflow,
    accent: 'from-emerald-400/25 to-lime-400/10 border-emerald-400/40',
  },
  {
    id: '03',
    title: 'Feature Mapping',
    description:
      'Flow fields are aligned to the exact model feature schema so inference always receives a consistent input vector.',
    icon: FileScan,
    accent: 'from-amber-400/25 to-orange-400/10 border-amber-400/40',
  },
  {
    id: '04',
    title: 'ML Inference',
    description:
      'The trained XGBoost multiclass model predicts attack categories for each flow and outputs confidence scores.',
    icon: BrainCircuit,
    accent: 'from-fuchsia-400/25 to-rose-400/10 border-fuchsia-400/40',
  },
  {
    id: '05',
    title: 'Decision & Reporting',
    description:
      'Predictions are summarized into benign vs attack counts, trend charts, history records, and downloadable result files.',
    icon: ShieldCheck,
    accent: 'from-cyan-400/25 to-sky-400/10 border-cyan-400/40',
  },
];

const systemFacts = [
  { label: 'Backend', value: 'FastAPI service for API + live scan orchestration' },
  { label: 'Flow Engine', value: 'NFStream-ready flow schema with robust feature adaptation' },
  { label: 'Model', value: 'XGBoost multiclass intrusion classifier' },
  { label: 'Output', value: 'Real-time dashboard updates + CSV result archives' },
];

export const HowItWorks = () => {
  return (
    <section className="space-y-6">
      <div className="panel relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute -top-24 right-[-40px] h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-[-40px] h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/90">NIDS Blueprint</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-100 md:text-3xl">How The Detection Pipeline Works</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              This page explains the exact flow from raw network traffic to actionable intrusion alerts so users can understand what happens behind every scan.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-cyan-400/35 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-200">
            <Activity className="h-4 w-4" />
            End-to-End Visibility
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {pipelineSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article
              key={step.id}
              className="panel group relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${step.accent}`} />
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs font-semibold text-slate-300">
                  {step.id}
                </span>
                <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-2 text-cyan-300">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-slate-100">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.description}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="panel p-5 lg:col-span-3">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-100">
            <Database className="h-5 w-5 text-cyan-300" />
            System Process Flow
          </h3>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-4">
              <p className="font-medium text-slate-100">1. User starts scan from dashboard</p>
              <p className="mt-1">Frontend sends a request to the live scan endpoint with capture duration.</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-4">
              <p className="font-medium text-slate-100">2. Backend executes capture and preprocessing</p>
              <p className="mt-1">Packet capture and flow extraction run in sequence, with status updates published while scanning.</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-4">
              <p className="font-medium text-slate-100">3. Model predicts and classifies traffic</p>
              <p className="mt-1">Each flow is classified into benign or attack types, then aggregated for readable insights.</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-4">
              <p className="font-medium text-slate-100">4. Results rendered and stored</p>
              <p className="mt-1">Dashboard visuals update, history is appended, and CSV reports are saved for audits.</p>
            </div>
          </div>
        </div>

        <div className="panel p-5 lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-slate-100">Architecture Snapshot</h3>
          <ul className="space-y-3">
            {systemFacts.map((fact) => (
              <li key={fact.label} className="rounded-xl border border-slate-700 bg-slate-900/45 p-3">
                <p className="text-xs uppercase tracking-wide text-cyan-300">{fact.label}</p>
                <p className="mt-1 text-sm text-slate-200">{fact.value}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
