import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-4 text-center">
        <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          SaaS Bootstrap
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          {siteConfig.name}
        </h1>
        <p className="text-muted-foreground">{siteConfig.description}</p>
        <p className="text-muted-foreground text-sm">
          Project scaffold is ready for feature development.
        </p>
      </div>
    </main>
  );
}
