import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4" dir="auto">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-700/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Compass className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-amiri font-bold text-foreground">
            الصفحة غير موجودة
          </h1>
          <p className="text-sm font-tajawal text-muted-foreground leading-relaxed">
            الرابط الذي فتحته لا يقود إلى صفحة في الصرح. ربما تغيّر المسار أو كُتب بغير قصد.
          </p>
          <Button asChild className="font-cairo">
            <Link href="/">العودة إلى بوابة النور</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
