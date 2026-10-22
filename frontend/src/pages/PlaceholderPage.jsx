import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title, description }) {
  return <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Construction className="mx-auto h-10 w-10 text-indigo-600" /><h1 className="mt-4 text-2xl font-bold text-slate-900">{title}</h1><p className="mx-auto mt-2 max-w-md text-slate-500">{description}</p><p className="mt-6 text-sm text-slate-400">This screen is intentionally wired as the next implementation increment.</p></div>;
}
