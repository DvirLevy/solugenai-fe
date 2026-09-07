export function PageHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-6 text-center">
      <h1 className="text-foreground text-2xl font-bold sm:text-3xl">{title}</h1>
      {subtitle ? (
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
