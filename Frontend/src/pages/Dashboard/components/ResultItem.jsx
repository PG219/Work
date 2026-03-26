const ResultItem = ({ color, status, title, description }) => (
  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
    <div className="flex items-center gap-3">
      <span className={`text-${color}-500 text-2xl`} aria-label={status}>●</span>
      <div>
        <div className="font-bold">{title}</div>
        <div className="text-gray-500 text-sm">{description}</div>
      </div>
    </div>
    <div className={`text-${color}-600 font-bold`}>{status}</div>
  </div>
);

export default ResultItem;
