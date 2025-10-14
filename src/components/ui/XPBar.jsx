const XPBar = ({ current, max, level }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm font-semibold text-white">
        <span>Niveau {level}</span>
        <span className="text-yellow-400">
          XP: {current} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-700 h-3 rounded-full mt-1">
        <div
          className="h-3 rounded-full bg-yellow-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default XPBar;
