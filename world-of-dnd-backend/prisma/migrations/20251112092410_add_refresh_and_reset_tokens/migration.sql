-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT;
