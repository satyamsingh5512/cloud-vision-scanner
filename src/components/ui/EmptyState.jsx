const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
    <div className="mb-4 rounded-xl bg-white/10 p-3 text-primary">✦</div>
    <h3 className="text-lg font-semibold text-primary">{title}</h3>
    <p className="mt-2 max-w-md text-sm text-secondary">{description}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);

export default EmptyState;
