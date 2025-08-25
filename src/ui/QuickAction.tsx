import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowDown, Wallet, ChevronRight } from "lucide-react";

type Props = {
  to: string;
  title: string;
  subtitle: string;
  icon: "arrow" | "down" | "wallet";
  color?: "indigo" | "green" | "amber";
  disabled?: boolean;
};

type ColorKey = NonNullable<Props["color"]>;

const COLOR_MAP: Record<ColorKey, string> = {
  indigo: "text-indigo-600 bg-indigo-50",
  green: "text-emerald-600 bg-emerald-50",
  amber: "text-amber-600 bg-amber-50",
};

function QuickAction({
  to,
  title,
  subtitle,
  icon,
  color = "indigo",
  disabled,
}: Props) {
  const IconEl = useMemo(() => {
    switch (icon) {
      case "arrow":
        return <ArrowRight size={20} strokeWidth={2.5} />;
      case "down":
        return <ArrowDown size={20} strokeWidth={2.5} />;
      case "wallet":
        return <Wallet size={20} strokeWidth={2.5} />;
      default:
        return null;
    }
  }, [icon]);

  const badgeColor = useMemo(() => COLOR_MAP[color], [color]);

  const linkClass = useMemo(
    () =>
      `flex items-center justify-between rounded-2xl border border-slate-700 border-slate-200 bg-[#1d293d] p-5 shadow-sm transition hover:shadow-md ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`,
    [disabled]
  );

  const toResolved = disabled ? "#" : to;

  return (
    <Link to={toResolved} className={linkClass}>
      <div>
        <div className={`inline-flex items-center gap-2 rounded-xl ${badgeColor} px-2.5 py-1.5`}>
          {IconEl}
        </div>
        <div className="mt-2">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-slate-500">{subtitle}</div>
        </div>
      </div>

      <ChevronRight className="h-6 w-6 text-slate-300" />
    </Link>
  );
}

export default memo(QuickAction);
