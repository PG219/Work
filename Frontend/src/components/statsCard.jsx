import {Card, CardContent} from '@/components/ui/card';

// eslint-disable-next-line no-unused-vars
const StatsCard = ({ title, value, icon: Icon, variant }) => {
  const variantStyles = {
    danger: "text-red-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  };

  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-card-foreground">{value}</p>
          </div>
          <Icon className={`w-8 h-8 ${variantStyles[variant]}`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
