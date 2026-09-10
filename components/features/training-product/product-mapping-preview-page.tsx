"use client";

import { FormEvent, useState } from "react";
import { previewProductMappings } from "@/lib/api";
import { ProductMappingPreview } from "@/types/store-pilot";
import { ActionButton } from "@/components/ui/action-button";

export function ProductMappingPreviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mappingFile, setMappingFile] = useState<File | null>(null);
  const [result, setResult] = useState<ProductMappingPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [failedOnly, setFailedOnly] = useState(false);
  const [page, setPage] = useState(0);
  const products = result?.products ?? [];
  const failedCount = products.filter((item) => item.reason !== null).length;
  const filtered = failedOnly ? products.filter((item) => item.reason !== null) : products;
  const pageCount = Math.max(1, Math.ceil(filtered.length / 50));

  function changeFile(selected: File | null, mapping: boolean) {
    if (mapping) setMappingFile(selected); else setFile(selected);
    setResult(null);
    setError("");
    setPage(0);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !mappingFile) return;
    setBusy(true);
    setError("");
    setResult(null);
    setPage(0);
    try {
      setResult(await previewProductMappings(file, mappingFile));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "매핑 확인 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-5 lg:col-span-2">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">상품 카테고리 매핑 확인</h2>
        <div className="my-5 rounded-lg border-l-4 border-teal-700 bg-teal-50 p-4 text-sm leading-6 text-slate-700">
          <p>상품 파일의 마이카테 코드와 매핑 파일을 비교해 네이버 카테고리를 확인합니다. 학습이나 데이터 저장은 수행하지 않습니다.</p>
          <p>두 파일의 첫 번째 시트를 사용합니다. 상품 파일은 ‘상품명’, ‘마이카테’, 매핑 파일은 ‘마이카테’, ‘네이버카테’ 헤더를 유지해주세요.</p>
          <p>활성 네이버 카테고리 데이터가 필요합니다. 중복 마이카테 코드는 기존 업로드와 동일하게 마지막 매핑을 사용합니다.</p>
          <p>상품명이 빈 행은 제외합니다. 매핑 파일의 필수 헤더나 네이버 코드가 누락되면 파일을 수정한 뒤 다시 확인해주세요.</p>
        </div>
        <form className="grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-bold">상품 엑셀 (.xlsx)
            <input type="file" accept=".xlsx" disabled={busy} onChange={(e) => changeFile(e.target.files?.[0] ?? null, false)} className="rounded-md border border-slate-200 p-3" />
          </label>
          <label className="grid gap-2 text-sm font-bold">마이카테고리 매핑 엑셀 (.xlsx, .xls)
            <input type="file" accept=".xlsx,.xls" disabled={busy} onChange={(e) => changeFile(e.target.files?.[0] ?? null, true)} className="rounded-md border border-slate-200 p-3" />
          </label>
          <ActionButton disabled={busy || !file || !mappingFile} loading={busy}>네이버 카테고리 확인</ActionButton>
        </form>
        {error && <p role="alert" className="mt-4 text-sm font-bold text-red-700">{error}</p>}
      </div>
      {result && <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap justify-between gap-3 text-sm font-bold">
          <p>총 {products.length.toLocaleString()}개 · 매핑 성공 {products.length - failedCount}개 · 확인 필요 {failedCount}개</p>
          <label className="flex items-center gap-2"><input type="checkbox" checked={failedOnly} onChange={(e) => { setFailedOnly(e.target.checked); setPage(0); }} />확인 필요만 보기</label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50"><tr>{["엑셀 행", "상품명", "마이카테", "네이버 코드", "네이버 카테고리", "상태"].map((title) => <th key={title} className="whitespace-nowrap border border-slate-200 p-3">{title}</th>)}</tr></thead>
            <tbody>{filtered.slice(page * 50, (page + 1) * 50).map((item) => <tr key={item.rowNumber}>
              <td className="border border-slate-200 p-3">{item.rowNumber}</td>
              <td className="min-w-56 border border-slate-200 p-3">{item.productName}</td>
              <td className="border border-slate-200 p-3">{item.myCategoryCode || "—"}</td>
              <td className="border border-slate-200 p-3">{item.naverCategoryCode ?? "—"}</td>
              <td className="min-w-64 border border-slate-200 p-3">{item.naverCategoryFullPath ?? "—"}</td>
              <td className={`min-w-48 border border-slate-200 p-3 ${item.reason ? "text-red-700" : "text-teal-700"}`}>{item.reason ?? "매핑 성공"}</td>
            </tr>)}</tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="py-6 text-center text-sm text-slate-500">표시할 상품이 없습니다.</p>}
        <div className="mt-4 flex items-center justify-end gap-4 text-sm">
          <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} className="disabled:opacity-40">이전</button>
          <span>{page + 1} / {pageCount}</span>
          <button type="button" disabled={page + 1 >= pageCount} onClick={() => setPage(page + 1)} className="disabled:opacity-40">다음</button>
        </div>
      </div>}
    </section>
  );
}
