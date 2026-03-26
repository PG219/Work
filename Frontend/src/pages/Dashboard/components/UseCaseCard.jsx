const UseCaseCard = ({ title, description, status }) => (
  <div className="bg-blue-50 flex justify-between items-center p-4 rounded-xl shadow-sm">
    <div>
      <div className="text-blue-900 font-semibold">{title}</div>
      <div className="text-blue-600 text-sm">{description}</div>
    </div>
    <div className="bg-green-100 rounded-3xl px-4 py-1">
      <span className="text-green-700 font-medium">{status}</span>
    </div>
  </div>
);

export default UseCaseCard;
