const PageHeader = ({
  title,
  description,
}: { title: string; description?: string }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
export default PageHeader;
