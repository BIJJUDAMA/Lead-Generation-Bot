export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Lead-Generation-Bot Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Companies</h3>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Signals</h3>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">High Intent Leads</h3>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
      </div>

      <section className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">Recent Leads</h2>
          <p className="text-sm text-gray-500">Companies with recent growth signals detected.</p>
        </div>
        <div className="p-12 text-center text-gray-400">
          <p>No leads discovered yet. Run the discovery pipeline to populate this list.</p>
        </div>
      </section>
    </div>
  );
}
