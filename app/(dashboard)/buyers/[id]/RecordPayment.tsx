"use client";

import { useTransition, useRef, useState } from "react";
import { recordPayment } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Banknote, CircleCheckBig } from "lucide-react";

type Props = {
  buyerId: string;
  buyerName: string;
  totalDue: number;
};

export default function RecordPayment({ buyerId, buyerName, totalDue }: Props) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get("amount") as string);

    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (amount > totalDue) {
      setError(`Amount cannot exceed total due ৳${totalDue.toFixed(2)}.`);
      return;
    }

    startTransition(async () => {
      try {
        await recordPayment(formData);
        setSuccess(true);
        formRef.current?.reset();
        // 1.5s পরে dialog বন্ধ হবে
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setError(null);
          setSuccess(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="gap-2"
          disabled={totalDue <= 0}
          variant={totalDue > 0 ? "default" : "outline"}
        >
          <Banknote className="w-4 h-4" />
          Record Payment
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Paying against{" "}
            <span className="font-semibold text-slate-800">{buyerName}</span>
            {"'s"} due of{" "}
            <span className="font-semibold text-red-600">
              ৳{totalDue.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-green-600">
            <CircleCheckBig className="w-12 h-12" />
            <p className="font-semibold text-lg">Payment Recorded!</p>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="grid gap-4 pt-2"
          >
            <input type="hidden" name="buyerId" value={buyerId} />

            <div className="grid gap-2">
              <Label htmlFor="amount">Payment Amount (৳)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min={0.01}
                max={totalDue}
                placeholder="0.00"
                disabled={isPending}
                autoFocus
              />
              {/* Quick full payment button */}
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline text-left"
                onClick={() => {
                  const input =
                    formRef.current?.querySelector<HTMLInputElement>(
                      'input[name="amount"]',
                    );
                  if (input) input.value = totalDue.toFixed(2);
                }}
              >
                Pay full amount (৳
                {totalDue.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                )
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="w-36">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
