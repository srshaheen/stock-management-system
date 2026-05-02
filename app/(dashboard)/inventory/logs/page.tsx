import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default async function StockLogsPage() {
  const logs = await prisma.stockLog.findMany({
    include: {
      product: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stock Movement Logs</h1>
        <p className="text-sm text-slate-500">
          History of every stock update in your system.
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Product Model</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Qty Change</TableHead>
              <TableHead>Reason / Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-slate-500">
                  {format(new Date(log.createdAt), "dd MMM yyyy, hh:mm a")}
                </TableCell>
                <TableCell className="font-medium">
                  {log.product.modelName}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      log.changeType === "SALE"
                        ? "destructive"
                        : log.changeType === "RETURN"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {log.changeType}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`font-bold ${log.quantity > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                </TableCell>
                <TableCell className="text-sm text-slate-600 italic">
                  {log.reason}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
