"use client";

import { useMemo, useState } from "react";
import { Calculator as CalcIcon, Minus, Plus } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import {
  formatNepaliNumber,
  KABADI_DEFAULT_ITEM,
  KABADI_ITEMS,
} from "lib/kabadi/rates";

export function Calculator() {
  const [itemId, setItemId] = useState(KABADI_DEFAULT_ITEM.id);
  const [quantity, setQuantity] = useState(10);

  const item = useMemo(
    () => KABADI_ITEMS.find((i) => i.id === itemId) ?? KABADI_DEFAULT_ITEM,
    [itemId],
  );

  const estimate = item.rate * quantity;

  const step = 1;
  const unitLabel = item.unit === "kg" ? "kg" : "pieces";

  return (
    <section
      id="calculator"
      className="scroll-mt-24 border-b border-kabadi-border py-16 md:py-24"
    >
      <div className="mx-auto max-w-container-max px-gutter">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Copy */}
          <div>
            <p className="font-label-sm text-label-sm font-semibold uppercase tracking-[0.2em] text-kabadi-primary">
              Earnings Calculator
            </p>
            <h2 className="mt-2 font-display-lg text-4xl tracking-tight text-kabadi-on-bg">
              How much will I get?
            </h2>
            <p className="mt-3 text-base leading-relaxed text-kabadi-muted">
              Pick an item, enter how much you have, and see your estimated
              payout instantly. The number you see is the number you get — we
              weigh on a transparent digital scale at your door.
            </p>

            <div className="mt-8 rounded-2xl border border-kabadi-border bg-card p-6 shadow-sm">
              {/* Item select */}
              <Label className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-kabadi-muted">
                What are you selling?
              </Label>
              <Select
                value={itemId}
                onValueChange={(value) => {
                  setItemId(value);
                  const next = KABADI_ITEMS.find((i) => i.id === value);
                  if (next) setQuantity(next.unit === "kg" ? 10 : 1);
                }}
              >
                <SelectTrigger className="mt-2 h-auto w-full min-h-12 rounded-xl px-4 py-3 text-base">
                  <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    {KABADI_ITEMS.map((i) => (
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
                    className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-kabadi-muted"
                  >
                    Quantity
                  </Label>
                  <span className="font-label-sm text-label-sm text-kabadi-primary">
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
                    onChange={(e) => {
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
                className="mt-6 border-kabadi-border bg-kabadi-primary-soft p-5"
              >
                <AlertTitle className="flex items-center gap-2 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-kabadi-primary">
                  <CalcIcon className="size-4" />
                  Estimated payout
                </AlertTitle>
                <AlertDescription className="mt-1">
                  <p className="font-data-table text-4xl font-bold text-kabadi-primary">
                    Rs {formatNepaliNumber(estimate)}
                  </p>
                  <p className="mt-1 font-label-sm text-label-sm text-kabadi-muted">
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
              <Card className="w-80 rotate-2 rounded-2xl border-kabadi-border shadow-xl">
                <CardHeader>
                  <CardTitle className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-kabadi-muted">
                    Kabadi receipt · estimate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3 border-b border-dashed border-kabadi-border pb-4 font-label-sm text-label-sm">
                    <p className="flex justify-between">
                      <span className="text-kabadi-muted">Item</span>
                      <span className="font-medium text-kabadi-on-bg">
                        {item.name}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-kabadi-muted">Rate</span>
                      <span className="font-medium text-kabadi-on-bg">
                        Rs {formatNepaliNumber(item.rate)}/{item.unit}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-kabadi-muted">Quantity</span>
                      <span className="font-medium text-kabadi-on-bg">
                        {quantity} {unitLabel}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <span className="font-label-sm text-label-sm text-kabadi-muted">
                      You receive
                    </span>
                    <span className="font-data-table text-3xl font-bold text-kabadi-primary">
                      Rs {formatNepaliNumber(estimate)}
                    </span>
                  </div>
                  <p className="mt-4 rounded-lg bg-kabadi-accent/15 px-3 py-2 text-center font-label-sm text-label-sm font-semibold text-kabadi-accent-strong">
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
