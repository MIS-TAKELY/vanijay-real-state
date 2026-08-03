-- Convert the `role` column from a scalar enum to an enum array:
--   1. Drop the old scalar default first (a scalar default cannot be
--      auto-cast to the new array type).
--   2. Rewrite existing values as single-element arrays. Note: a direct cast
--      `role::"UserRole"[]` does NOT exist in PostgreSQL; `ARRAY[role]` is the
--      correct way to wrap each scalar value.
--   3. Re-apply the default as an array.
--   4. Add the phone verification flag used by the phoneNumber auth plugin.

-- 1) Drop the old scalar default before the type change
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

-- 2) Scalar enum -> enum array; wrap existing values in single-element arrays
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "UserRole"[] USING ARRAY["role"];

-- 3) New array-typed default
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT ARRAY['BUYER']::"UserRole"[];

-- 4) Track whether the user has verified their phone number (phoneNumber plugin)
ALTER TABLE "users" ADD COLUMN "phoneNumberVerified" BOOLEAN NOT NULL DEFAULT false;
