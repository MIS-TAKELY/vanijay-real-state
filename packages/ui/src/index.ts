export { cn } from "./lib/utils";

/* ------------------------------------------------------------------ */
/* Layout primitives (domain — not shadcn)                             */
/* ------------------------------------------------------------------ */

export { Container } from "./components/Container";
export type { ContainerProps } from "./components/Container";

export { Section, sectionVariants } from "./components/Section";
export type { SectionProps } from "./components/Section";

export { Stat } from "./components/Stat";
export type { StatProps } from "./components/Stat";

export { Icon, iconVariants } from "./components/Icon";
export type { IconProps } from "./components/Icon";

/* ------------------------------------------------------------------ */
/* Lucide icons commonly used by apps                                  */
/* ------------------------------------------------------------------ */

export {
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MoreVertical,
  Search,
  Shield,
  Timer,
  User,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* shadcn/ui primitives                                                */
/* ------------------------------------------------------------------ */

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./components/ui/accordion";

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/ui/alert-dialog";

export { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from "./components/ui/avatar";

export { Badge, badgeVariants } from "./components/ui/badge";

export { Calendar } from "./components/ui/calendar";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./components/ui/breadcrumb";

export { Button, buttonVariants } from "./components/ui/button";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "./components/ui/card";

export { Checkbox } from "./components/ui/checkbox";

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./components/ui/dropdown-menu";

export { Input } from "./components/ui/input";

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./components/ui/input-otp";

export { Label } from "./components/ui/label";

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "./components/ui/popover";

export { Progress } from "./components/ui/progress";

export { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";

export { ScrollArea, ScrollBar } from "./components/ui/scroll-area";

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

export { Separator } from "./components/ui/separator";

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./components/ui/sheet";

export { Skeleton } from "./components/ui/skeleton";

export { Slider } from "./components/ui/slider";

export { Toaster } from "./components/ui/sonner";

export { Switch } from "./components/ui/switch";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./components/ui/table";

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
} from "./components/ui/tabs";

export { Textarea } from "./components/ui/textarea";

export { Toggle, toggleVariants } from "./components/ui/toggle";

export { ToggleGroup, ToggleGroupItem } from "./components/ui/toggle-group";

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./components/ui/tooltip";

/* ------------------------------------------------------------------ */
/* Maps (react-leaflet re-exports)                                     */
/* ------------------------------------------------------------------ */
// NOTE: only re-export from `react-leaflet` here — it is SSR-safe. Do NOT
// re-export `leaflet` itself or any module that imports it (e.g. MapPicker,
// setupLeafletDefaults): raw `leaflet` references `window` at module load
// and would crash Server Components that import this barrel ("window is not
// defined"). Those browser-only pieces live behind the `@repo/ui/map`
// subpath export so they only enter the client bundle.

export { MapContainer, TileLayer, Popup, useMap } from "react-leaflet";

/* ------------------------------------------------------------------ */
/* Reusable location components                                        */
/* ------------------------------------------------------------------ */

// LocationSearch is SSR-safe (no leaflet import — only a fetch in an effect),
// so it can live in the main barrel.
// MapPicker / setupLeafletDefaults import raw `leaflet` → import them from
// `@repo/ui/map` instead, only in client components.
export { LocationSearch } from "./components/LocationSearch";
export type {
  GeocodeResult,
  LocationSearchProps,
} from "./components/LocationSearch";
