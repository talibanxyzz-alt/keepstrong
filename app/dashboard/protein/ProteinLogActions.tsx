"use client";

import { useEffect, useState } from "react";
import { MealPhotoLogger } from "@/components/features/MealPhotoLogger";
import QuickAddFood from "@/components/features/QuickAddFood";

type Props = {
  userId: string;
  isPremium: boolean;
  initialTodayTotal: number;
};

export default function ProteinLogActions({
  userId,
  isPremium,
  initialTodayTotal,
}: Props) {
  const [todayTotal, setTodayTotal] = useState(initialTodayTotal);

  useEffect(() => {
    setTodayTotal(initialTodayTotal);
  }, [initialTodayTotal]);

  return (
    <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Today</p>
        <p className="text-lg font-semibold text-gray-900">{todayTotal}g protein</p>
      </div>

      <MealPhotoLogger
        userId={userId}
        isPremium={isPremium}
        onLogged={(proteinG) => setTodayTotal((prev) => prev + proteinG)}
      />

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs text-gray-400">or log manually</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <QuickAddFood />
    </div>
  );
}
