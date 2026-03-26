const RiskAlertItem = ({ color, title, description, icon }) => (
  <div className={`flex flex-col bg-${color}-50 border-l-4 border-${color}-500 rounded-xl p-4`}>
    <div className={`font-bold text-${color}-700 flex items-center gap-2`}>
      <span role="img" aria-label={title}>{icon}</span> {title}
    </div>
    <div className={`text-${color}-600`}>{description}</div>
  </div>
);

export default RiskAlertItem;
