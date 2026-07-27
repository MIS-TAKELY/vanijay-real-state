export function Pagination() {
  return (
    <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-3 px-6 py-10">
      <button type="button" className="flex h-9 w-9 items-center justify-center text-[#727972] hover:text-[#1B1C19]">
        ←
      </button>
      <button type="button" className="border-b-2 border-[#244530] px-2 text-sm font-semibold text-[#244530]">
        01
      </button>
      <button type="button" className="px-2 text-sm text-[#424842] hover:text-[#1B1C19]">
        02
      </button>
      <button type="button" className="px-2 text-sm text-[#424842] hover:text-[#1B1C19]">
        03
      </button>
      <span className="px-1 text-sm text-[#727972]">…</span>
      <button type="button" className="px-2 text-sm text-[#424842] hover:text-[#1B1C19]">
        12
      </button>
      <button type="button" className="flex h-9 w-9 items-center justify-center text-[#727972] hover:text-[#1B1C19]">
        →
      </button>
    </div>
  );
}
