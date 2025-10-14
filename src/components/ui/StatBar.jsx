const StatBar = ({ stat, value, color, isEffective = false }) => {
  const displayValue = isEffective ? Math.floor(value / 10) : value;
  const max = isEffective ? 20 : 18;
  const percentage = (displayValue / max) * 100;

  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm font-semibold">
        <span>{stat.replace(/_/g, " ")}</span>
        <span>
          {displayValue} <span className="text-gray-400">({value})</span>
        </span>
      </div>
      <div className="w-full bg-gray-700 h-2 rounded-full mt-1">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default StatBar;
