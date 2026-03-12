export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">This module is coming soon.</p>
      </div>
    </div>
  );
}
