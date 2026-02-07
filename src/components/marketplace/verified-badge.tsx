import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function VerifiedBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Pawsitive Verified — reviewed and approved by the community</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
