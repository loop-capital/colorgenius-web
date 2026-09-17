ALTER TABLE "formula_purchases" ADD COLUMN "status" VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE "formula_purchases" ADD COLUMN "squareCheckoutId" VARCHAR(255);
ALTER TABLE "formula_purchases" ADD COLUMN "squarePaymentId" VARCHAR(255);
CREATE INDEX "idx_formula_purchases_square_checkout" ON "formula_purchases"("squareCheckoutId");
