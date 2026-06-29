import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProtectedOwnerFeaturePlaceholderProps = {
  title: string;
  description: string;
};

export function ProtectedOwnerFeaturePlaceholder({
  title,
  description,
}: ProtectedOwnerFeaturePlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
