import { cn } from "@/lib/utils";

export type AppIconName =
  | "alert"
  | "analytics"
  | "back"
  | "bag"
  | "barcode"
  | "box"
  | "branch"
  | "calendar"
  | "camera"
  | "card"
  | "cash-register"
  | "cash"
  | "chart"
  | "check-circle"
  | "check"
  | "chemical"
  | "clipboard"
  | "clock-pending"
  | "clock"
  | "close"
  | "cloud"
  | "coupon"
  | "customer"
  | "customers"
  | "dashboard"
  | "database"
  | "delete"
  | "detergent"
  | "download"
  | "dress"
  | "dry-cleaning"
  | "dry"
  | "dryer"
  | "edit"
  | "employee"
  | "export"
  | "eye-off"
  | "eye"
  | "filter"
  | "fold"
  | "forward"
  | "gift"
  | "hanger"
  | "heart"
  | "help"
  | "home"
  | "image"
  | "import"
  | "info"
  | "inventory"
  | "invoice"
  | "iron"
  | "language"
  | "link"
  | "location"
  | "lock"
  | "login"
  | "logout"
  | "mail"
  | "menu"
  | "minus"
  | "mobile-money"
  | "money"
  | "more-horizontal"
  | "more-vertical"
  | "motorbike"
  | "notification"
  | "order"
  | "orders"
  | "payment"
  | "percentage"
  | "phone"
  | "plus"
  | "print"
  | "qr"
  | "quality"
  | "receipt"
  | "refresh"
  | "report"
  | "role"
  | "route"
  | "schedule"
  | "search"
  | "settings"
  | "shirt"
  | "shoe"
  | "staff"
  | "stain"
  | "star"
  | "steam"
  | "store"
  | "support"
  | "tag"
  | "task"
  | "theme"
  | "trousers"
  | "truck"
  | "tshirt"
  | "unlock"
  | "upload"
  | "user"
  | "wallet"
  | "wash"
  | "washing-machine"
  | "whatsapp"
  | "wifi";

/**
 * Icône du set maison SPARK PRESSING (sprite `public/icons`).
 * Hérite de la couleur du texte (`currentColor`) comme lucide.
 * Règle : utiliser en priorité ; lucide uniquement si aucun équivalent.
 */
export function AppIcon({
  name,
  className,
  strokeWidth = 1.8,
}: {
  name: AppIconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <use href={`/icons/pressing-luxe-sprite.svg#icon-${name}`} />
    </svg>
  );
}
