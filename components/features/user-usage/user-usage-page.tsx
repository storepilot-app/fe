"use client";

import { useEffect, useState } from "react";
import { Activity, CalendarDays, Images, SearchCheck } from "lucide-react";
import { getMyUsage } from "@/lib/api";
import { UserUsage, UserUsagePeriod } from "@/types/store-pilot";

const PERIODS: Array<{ value: UserUsagePeriod; label: string }> = [
  { value: "TODAY", label: "오늘" },
  { value: "MONTH", label: "이번 달" },
  { value: "TOTAL", label: "전체" },
];

export function UserUsagePage() {
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [period, setPeriod] = useState<UserUsagePeriod>("TODAY");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    getMyUsage(period)
      .then((body) => {
        if (active) {
          setUsage(body.data ?? null);
        }
      })
      .catch((error) => {
        if (active) {
          setMessage(error instanceof Error ? error.message : "사용량을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [period]);

  function handlePeriodChange(nextPeriod: UserUsagePeriod) {
    if (nextPeriod === period) {
      return;
    }
    setLoading(true);
    setMessage("");
    setPeriod(nextPeriod);
  }

  return (
    <section className="grid gap-5 lg:col-span-2">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(23,33,38,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-teal-700" aria-hidden="true" />
              <h2 className="text-xl font-black text-slate-950">내 사용량</h2>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              StorePilot에서 처리한 상품과 이미지 다운로드 사용량을 확인할 수 있습니다.
            </p>
          </div>
          <div className="flex rounded-md bg-slate-100 p-1" aria-label="사용량 조회 기간">
            {PERIODS.map((item) => (
              <button
                className={[
                  "h-9 cursor-pointer rounded px-4 text-sm font-extrabold transition",
                  period === item.value
                    ? "bg-white text-teal-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                ].join(" ")}
                key={item.value}
                onClick={() => handlePeriodChange(item.value)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="mt-4 text-sm font-bold text-slate-500">사용량을 불러오는 중입니다...</p>}
        {message && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <UsageCard
          description="카테고리와 키워드 찾기를 실행한 횟수입니다."
          icon={SearchCheck}
          label="카테고리 작업"
          value={`${(usage?.categoryKeywordJobCount ?? 0).toLocaleString()}회`}
        />
        <UsageCard
          description="카테고리와 키워드를 찾은 상품 수입니다."
          icon={CalendarDays}
          label="처리 상품"
          value={`${(usage?.processedProductCount ?? 0).toLocaleString()}개`}
        />
        <UsageCard
          description="성공적으로 내려받은 상품 이미지 수입니다."
          icon={Images}
          label="이미지 다운로드"
          value={`${(usage?.imageDownloadCount ?? 0).toLocaleString()}개`}
        />
        <UsageCard
          description="카테고리 학습을 요청한 횟수입니다."
          icon={Activity}
          label="학습 요청"
          value={`${(usage?.categoryLearningRequestCount ?? 0).toLocaleString()}회`}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
        선택한 기간의 마지막 사용 날짜: <span className="font-black text-slate-900">{formatDate(usage?.lastUsedDate ?? null)}</span>
      </div>
    </section>
  );
}

function UsageCard({
  description,
  icon: Icon,
  label,
  value,
}: {
  description: string;
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-teal-700">
        <Icon className="size-5" aria-hidden="true" />
        <p className="text-sm font-extrabold">{label}</p>
      </div>
      <p className="mt-4 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "사용 기록 없음";
  }
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
}
