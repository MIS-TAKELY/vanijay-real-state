export function VerifiedStamp() {
  return (
    <div className="flex justify-center px-6 pb-16">
      <div
        className="flex h-24 w-24 rotate-6 flex-col items-center justify-center border-2 border-[#7D1118] bg-transparent text-center"
        style={{ borderRadius: "4px" }}
      >
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7D1118]">
          VERIFIED
        </span>
        <span className="mt-0.5 text-[9px] font-semibold tracking-[0.8px] text-[#7D1118]">
          LEKHAPRATI
        </span>
        <svg
          className="mt-1 h-5 w-5 text-[#7D1118]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>
    </div>
  );
}
