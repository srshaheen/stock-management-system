import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logoutAction } from "./logout-action";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-slate-500 hover:text-red-600 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </form>
  );
}
