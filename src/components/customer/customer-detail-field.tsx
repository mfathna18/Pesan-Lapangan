type CustomerDetailFieldProps = {
  label: string;
  value: string;
  emphasis?: boolean;
  className?: string;
};

export function CustomerDetailField({
  label,
  value,
  emphasis = false,
  className,
}: CustomerDetailFieldProps) {
  return (
    <div className={className}>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p
        className={
          emphasis
            ? "text-xl font-semibold tracking-tight tabular-nums"
            : "font-medium"
        }
      >
        {value}
      </p>
    </div>
  );
}
