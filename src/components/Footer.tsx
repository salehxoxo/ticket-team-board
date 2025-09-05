import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground pl-10">TaskFlow</h3>
            <Badge variant="outline" className="text-xs">v1.0.0</Badge>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>© 2025 TaskFlow. All rights reserved.</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Keenu</span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}