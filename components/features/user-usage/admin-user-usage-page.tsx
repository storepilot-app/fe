"use client";

import { useEffect, useState } from "react";
import { Activity, CalendarDays, Images, SearchCheck, Users } from "lucide-react";
import { getAdminUserUsages } from "@/lib/api";
import { AdminUserUsage, UserUsagePeriod } from "@/types/store-pilot";

const PERIODS: Array<{ value: UserUsagePeriod; label: string }> = [
  { value: "TODAY", label: "오늘" },
  { value: "MONTH", label: "이번 달" },
  { value: "TOTAL", label: "전체" },
];

export function AdminUserUsagePage() {
  const [users, setUsers] = useState<AdminUserUsage[]>([]);
  const [period, setPeriod] = useState<UserUsagePeriod>("TODAY");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    getAdminUserUsages(period)
      .then((body) => {
        if (active) {
          setUsers(body.data?.users ?? []);
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

  const totals = users.reduce((result, user) => {
    return {
      categoryKeywordJobCount: result.categoryKeywordJobCount + user.categoryKeywordJobCount,
      processedProductCount: result.processedProductCount + user.processedProductCount,
      imageDownloadCount: result.imageDownloadCount + user.imageDownloadCount,
      categoryLearningRequestCount: result.categoryLearningRequestCount + user.categoryLearningRequestCount,
    };
  }, emptyUsage());

  return (
    <section className="grid gap-5 lg:col-span-2">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(23,33,38,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-teal-700" aria-hidden="true" />
              <h2 className="text-xl font-black text-slate-950">사용자 사용량</h2>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              사용자별 카테고리 찾기, 이미지 다운로드와 학습 요청 사용량을 확인합니다.
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

        {message && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard icon={Users} label="전체 사용자" value={`${users.length.toLocaleString()}명`} />
        <SummaryCard icon={SearchCheck} label="카테고리 작업" value={`${totals.categoryKeywordJobCount.toLocaleString()}회`} />
        <SummaryCard icon={CalendarDays} label="처리 상품" value={`${totals.processedProductCount.toLocaleString()}개`} />
        <SummaryCard icon={Images} label="이미지 다운로드" value={`${totals.imageDownloadCount.toLocaleString()}개`} />
        <SummaryCard icon={Activity} label="학습 요청" value={`${totals.categoryLearningRequestCount.toLocaleString()}회`} />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading && <p className="p-6 text-sm font-bold text-slate-500">사용량을 불러오는 중입니다...</p>}
        {!loading && users.length === 0 && (
          <p className="p-6 text-sm font-bold text-slate-500">가입한 사용자가 없습니다.</p>
        )}
        {!loading && users.length > 0 && (
          <div className="max-h-[calc(100vh-310px)] overflow-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs font-black text-slate-500">
                <tr>
                  <th className="min-w-64 px-4 py-3">사용자</th>
                  <th className="whitespace-nowrap px-4 py-3">권한</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right">카테고리 작업</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right">처리 상품</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right">이미지 다운로드</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right">학습 요청</th>
                  <th className="whitespace-nowrap px-4 py-3">마지막 사용</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {users.map((user) => (
                    <tr className="hover:bg-slate-50" key={user.userId}>
                      <td className="px-4 py-3 font-bold text-slate-900">{user.email}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-500">
                        {user.role === "ADMIN" ? "관리자" : "사용자"}
                      </td>
                      <UsageCell value={user.categoryKeywordJobCount} suffix="회" />
                      <UsageCell value={user.processedProductCount} suffix="개" />
                      <UsageCell value={user.imageDownloadCount} suffix="개" />
                      <UsageCell value={user.categoryLearningRequestCount} suffix="회" />
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-500">
                        {formatDate(user.lastUsedDate)}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function emptyUsage() {
  return {
    categoryKeywordJobCount: 0,
    processedProductCount: 0,
    imageDownloadCount: 0,
    categoryLearningRequestCount: 0,
  };
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="size-4" aria-hidden="true" />
        <p className="text-xs font-extrabold">{label}</p>
      </div>
      <p className="mt-2 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function UsageCell({ value, suffix }: { value: number; suffix: string }) {
  return (
    <td className="whitespace-nowrap px-4 py-3 text-right font-extrabold text-slate-700">
      {value.toLocaleString()}{suffix}
    </td>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
}
