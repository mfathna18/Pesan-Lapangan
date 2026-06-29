"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  REVENUE_DATE_RANGE,
  type RevenueDateRangePreset,
} from "@/domains/payment/constants";

type RevenueDateRangeFilterProps = {
  preset: RevenueDateRangePreset;
  customFrom?: string;
  customTo?: string;
};

export function RevenueDateRangeFilter({
  preset,
  customFrom,
  customTo,
}: RevenueDateRangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [range, setRange] = useState<RevenueDateRangePreset>(preset);
  const [from, setFrom] = useState(customFrom ?? "");
  const [to, setTo] = useState(customTo ?? "");

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);

    if (range === REVENUE_DATE_RANGE.CUSTOM) {
      if (from) {
        params.set("from", from);
      } else {
        params.delete("from");
      }

      if (to) {
        params.set("to", to);
      } else {
        params.delete("to");
      }
    } else {
      params.delete("from");
      params.delete("to");
    }

    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
      <div className="space-y-2">
        <Label>Date Range</Label>
        <Select
          value={range}
          onValueChange={(value) =>
            setRange(
              (value ??
                REVENUE_DATE_RANGE.THIRTY_DAYS) as RevenueDateRangePreset,
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={REVENUE_DATE_RANGE.TODAY}>Today</SelectItem>
            <SelectItem value={REVENUE_DATE_RANGE.SEVEN_DAYS}>
              7 Days
            </SelectItem>
            <SelectItem value={REVENUE_DATE_RANGE.THIRTY_DAYS}>
              30 Days
            </SelectItem>
            <SelectItem value={REVENUE_DATE_RANGE.CUSTOM}>
              Custom Range
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {range === REVENUE_DATE_RANGE.CUSTOM ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="revenue-from">From</Label>
            <Input
              id="revenue-from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="revenue-to">To</Label>
            <Input
              id="revenue-to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="hidden xl:block" />
      )}

      <div className="flex items-end">
        <Button
          type="button"
          onClick={applyFilters}
          className="w-full md:w-auto"
        >
          Apply Filter
        </Button>
      </div>
    </div>
  );
}
