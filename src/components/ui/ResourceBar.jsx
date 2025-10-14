const ResourceBar = ({ label, current, max, colorClass }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  const displayCurrent = Math.max(0, Math.floor(current));
  const isLow = current <= max * 0.2;

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm font-semibold text-white">
        <span>{label}</span>
        <span
          className={isLow ? "text-red-400 animate-pulse" : "text-green-400"}>
          {displayCurrent} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-700 h-3 rounded-full mt-1">
        <div
          className={`h-3 rounded-full ${colorClass} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ResourceBar;
