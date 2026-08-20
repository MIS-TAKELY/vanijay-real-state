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

export { BrandLogo } from "./components/BrandLogo";
export type { BrandLogoProps } from "./components/BrandLogo";

export { BouncingAppSwitcher } from "./components/BouncingAppSwitcher";
export type { BouncingAppSwitcherProps } from "./components/BouncingAppSwitcher";

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

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./components/ui/accordion";

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

export { Combobox } from "./components/ui/combobox";
export type { ComboboxOption, ComboboxProps } from "./components/ui/combobox";

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

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./components/ui/sidebar";

export { Skeleton } from "./components/ui/skeleton";

export { Slider } from "./components/ui/slider";

export { Toaster } from "./components/ui/sonner";

// Re-exported so apps can fire toasts without depending on `sonner` directly
// (the package lives in @repo/ui's dependency tree).
export { toast } from "sonner";

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
/* Charts (TanStack Charts — reusable dashboard primitives)            */
/* ------------------------------------------------------------------ */

export {
  CHART_THEME,
  formatNumber,
  formatCompact,
  formatNpr,
  formatMonth,
  formatTickDate,
} from "./components/charts/format";

export { FunnelChart } from "./components/charts/FunnelChart";
export type { FunnelStep } from "./components/charts/FunnelChart";

export { ActivityChart } from "./components/charts/ActivityChart";
export type { ActivityDay } from "./components/charts/ActivityChart";

export { Donut, fromGroupBy } from "./components/charts/Donut";
export type { DonutSlice } from "./components/charts/Donut";

export { PriceTrendChart } from "./components/charts/PriceTrendChart";
export type { MarketPoint } from "./components/charts/PriceTrendChart";

export { HorizontalBars } from "./components/charts/HorizontalBars";

export { SearchQueriesChart } from "./components/charts/SearchQueriesChart";
export type { SearchInsights } from "./components/charts/SearchQueriesChart";

export { InquiryCharts } from "./components/charts/InquiryCharts";
export type { Leads } from "./components/charts/InquiryCharts";

export { DistrictBarChart } from "./components/charts/DistrictBarChart";
export type { DistrictDemand } from "./components/charts/DistrictBarChart";

export { PlatformCharts } from "./components/charts/PlatformCharts";
export type { PlatformHealth } from "./components/charts/PlatformCharts";

export { TrendChart } from "./components/charts/TrendChart";
export type { TrendPoint } from "./components/charts/TrendChart";

/* ------------------------------------------------------------------ */
/* Listing wizard (shared by the seller dashboard + admin console)     */
/* ------------------------------------------------------------------ */

export * from "./components/listing-wizard";

/* ------------------------------------------------------------------ */
/* Kabadi / Scrap page components                                     */
/* ------------------------------------------------------------------ */

export { KabadiCategoryView } from "./components/kabadi";
export type {
  KabadiCategoryViewProps,
  KabadiCategoryViewData,
  KabadiCategoryItem,
} from "./components/kabadi";

/* ------------------------------------------------------------------ */
/* Reusable location components                                        */
/* ------------------------------------------------------------------ */

export { LocationSearch } from "./components/LocationSearch";
export type {
  GeocodeResult,
  LocationSearchProps,
} from "./components/LocationSearch";

export { reverseGeocode } from "./components/reverseGeocode";
export type {
  ReverseGeocodeAddress,
  ReverseGeocodeOptions,
  ReverseGeocodeResult,
} from "./components/reverseGeocode";

export { reverseGeocodeGoogle } from "./components/googleReverseGeocode";
export type { GoogleReverseGeocodeOptions } from "./components/googleReverseGeocode";
