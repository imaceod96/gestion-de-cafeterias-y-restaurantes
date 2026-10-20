import { Package } from "lucide-react";

interface ProductThumbnailProps {
  photoUrl?: string | null;
  name: string;
  unit?: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizeClasses = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function ProductThumbnail({
  photoUrl,
  name,
  unit,
  className = "",
  size = "sm",
}: ProductThumbnailProps) {
  const hasPhoto = photoUrl && photoUrl.trim() !== "";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`rounded-lg bg-coffee-100 flex items-center justify-center overflow-hidden`}>
        {hasPhoto ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-1">
            <Package className="h-4 w-4 text-coffee-400" />
          </div>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-coffee-900 truncate">{name}</span>
        {unit && (
          <span className="text-xs text-coffee-500">{unit}</span>
        )}
      </div>
    </div>
  );
}