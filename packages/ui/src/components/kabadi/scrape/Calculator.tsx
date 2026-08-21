"use client";

import { useMemo, useState } from "react";
import { Calculator as CalcIcon, Minus, Plus } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../ui/alert";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import type { ScrapeItemSummary, OnSectionFieldChange } from "./types";
import { formatNepaliNumber } from "./helpers";
import { EditableField } from "./EditableField";

interface CalculatorProps {
  items: ScrapeItemSummary[];
  editable?: boolean;
  onFieldChange?: OnSectionFieldChange;
}

export function Calculator({ items, editable, onFieldChange }: CalculatorProps) {
  const defaultItem = items[0];
  const [itemId, setItemId] = useState(defaultItem?.id ?? "");
  const [quantity, setQuantity] = useState(10);

  const item = useMemo(
    () => items.find((i) => i.id === itemId) ?? defaultItem,
    [itemId, items, defaultItem],
  );

  const estimate = (item?.rate ?? 0) * quantity;
  const step = 1;
  const unitLabel = item?.unit === "kg" ? "kg" : "pieces";

  if (!item) return null;

  return (
    <section
      id="calculator"
      className="scroll-mt-24 border-b border-border py-16 md:py-24"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Copy */}
          <div>
            <p className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Earnings Calculator
            </p>
            <EditableField
              tag="h2"
              value="How much will I get?"
              onChange={(v) => onFieldChange?.("calculator", "heading", v)}
              editable={editable}
              className="mt-2 font-display-lg text-4xl tracking-tight text-foreground"
            />
            <EditableField
              tag="p"
              value="Pick an item, enter how much you have, and see your estimated payout instantly. The number you see is the number you get — we weigh on a transparent digital scale at your door."
              onChange={(v) => onFieldChange?.("calculator", "description", v)}
              editable={editable}
              multiline
              className="mt-3 text-base leading-relaxed text-muted-foreground"
            />

            <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
              {/* Item select */}
              <Label className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
                What are you selling?
              </Label>
              <Select
                value={itemId}
                onValueChange={(value: string) => {
                  setItemId(value);
                  const next = items.find((i) => i.id === value);
                  if (next) setQuantity(next.unit === "kg" ? 10 : 1);
                }}
              >
                <SelectTrigger className="mt-2 h-auto w-full min-h-12 rounded-xl px-4 py-3 text-base">
                  <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    {items.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name}
                        {i.nepali ? ` (${i.nepali})` : ""} —{" "}
                        {formatNepaliNumber(i.rate)}/
                        {i.unit === "kg" ? "kg" : "pc"}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Quantity stepper */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="kabadi-quantity"
                    className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Quantity
                  </Label>
                  <span className="font-label-sm text-label-sm text-primary">
                    {unitLabel}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-lg"
                    className="size-12 shrink-0"
                    onClick={() => setQuantity(Math.max(step, quantity - step))}
                    aria-label="Decrease quantity"
                  >
                    <Minus />
                  </Button>
                  <Input
                    id="kabadi-quantity"
                    type="number"
                    min={step}
                    step={item.unit === "piece" ? 1 : "any"}
                    value={quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const raw = Number(e.target.value);
                      const next =
                        item.unit === "piece" ? Math.floor(raw) : raw;
                      setQuantity(Math.max(step, next || step));
                    }}
                    aria-label="Quantity"
                    className="h-12 rounded-xl text-center font-data-table text-xl"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-lg"
                    className="size-12 shrink-0"
                    onClick={() => setQuantity(quantity + step)}
                    aria-label="Increase quantity"
                  >
                    <Plus />
                  </Button>
                </div>
              </div>

              {/* Estimate */}
              <Alert
                role="status"
                className="mt-6 border-border bg-accent p-5"
              >
                <AlertTitle className="flex items-center gap-2 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
                  <CalcIcon className="size-4" />
                  Estimated payout
                </AlertTitle>
                <AlertDescription className="mt-1">
                  <p className="font-data-table text-4xl font-bold text-primary">
                    Rs {formatNepaliNumber(estimate)}
                  </p>
                  <p className="mt-1 font-label-sm text-label-sm text-muted-foreground">
                    {quantity} {unitLabel} × Rs {formatNepaliNumber(item.rate)}/
                    {item.unit}
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Floating receipt visual */}
          <div className="relative hidden lg:block">
            <div className="kabadi-float absolute inset-0 flex items-center justify-center">
              <Card className="w-80 rotate-2 rounded-2xl border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Kabadi receipt · estimate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 border-b border-dashed border-border pb-4 font-label-sm text-label-sm">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Item</span>
                      <span className="font-medium text-foreground">
                        {item.name}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-medium text-foreground">
                        Rs {formatNepaliNumber(item.rate)}/{item.unit}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-medium text-foreground">
                        {quantity} {unitLabel}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <span className="font-label-sm text-label-sm text-muted-foreground">
                      You receive
                    </span>
                    <span className="font-data-table text-3xl font-bold text-primary">
                      Rs {formatNepaliNumber(estimate)}
                    </span>
                  </div>
                  <p className="mt-4 rounded-lg bg-gold/15 px-3 py-2 text-center font-label-sm text-label-sm font-semibold text-gold-deep">
                    Cash on the spot ✓
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
