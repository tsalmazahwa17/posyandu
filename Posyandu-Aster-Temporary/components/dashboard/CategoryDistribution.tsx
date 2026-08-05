interface CategoryItem {
  id: number;
  name: string;
  count: number;
  percentage: number;
}

const COLORS = [
  "bg-pink-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-blue-500",
  "bg-amber-500",
];

export default function CategoryDistribution({
  items,
}: {
  items: CategoryItem[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
      <h2 className="text-sm font-bold text-gray-800">Kategori Sasaran</h2>
      <p className="text-xs text-gray-400 mt-0.5 mb-5">
        Distribusi sasaran aktif per kategori
      </p>

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={item.id}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-gray-600">{item.name}</span>
              <span className="text-gray-400">
                {item.count} · {item.percentage}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${COLORS[i % COLORS.length]}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
