const styles: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  'no-show': 'bg-gray-100 text-gray-600',
  consultation: 'bg-purple-50 text-purple-700',
  'follow-up': 'bg-orange-50 text-orange-700',
  'check-up': 'bg-teal-50 text-teal-700',
  emergency: 'bg-red-50 text-red-700',
  procedure: 'bg-indigo-50 text-indigo-700',
};

export default function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[value] ?? 'bg-gray-100 text-gray-600'}`}>
      {value.replace('-', ' ')}
    </span>
  );
}
