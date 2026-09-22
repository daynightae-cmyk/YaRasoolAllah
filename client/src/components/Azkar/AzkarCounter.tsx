import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AzkarCounterProps {
  type: "morning" | "evening" | "tasbih";
}

export default function AzkarCounter({ type }: AzkarCounterProps) {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [counts, setCounts] = useState({
    tasbih: 0,    // سبحان الله
    tahmid: 0,    // الحمد لله
    takbir: 0,    // الله أكبر
  });

  const updateCountMutation = useMutation({
    mutationFn: async (data: { azkarType: string; count: number }) => {
      const today = new Date().toISOString().split('T')[0];
      return apiRequest("POST", "/api/azkar/progress", {
        ...data,
        date: today,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/azkar/progress"] });
    },
  });

  const incrementCount = (countType: keyof typeof counts) => {
    setCounts(prev => {
      const newCounts = { ...prev, [countType]: prev[countType] + 1 };
      
      // Save to backend
      updateCountMutation.mutate({
        azkarType: `${type}_${countType}`,
        count: newCounts[countType],
      });

      // Check for completion (33, 33, 34 for traditional tasbih)
      const total = newCounts.tasbih + newCounts.tahmid + newCounts.takbir;
      if (total === 100) {
        toast({
          title: t("azkar.completed"),
          description: t("azkar.completed_message"),
        });
        
        // Reset counts
        setTimeout(() => {
          setCounts({ tasbih: 0, tahmid: 0, takbir: 0 });
        }, 2000);
      }

      return newCounts;
    });
  };

  const resetCounts = () => {
    setCounts({ tasbih: 0, tahmid: 0, takbir: 0 });
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white">
      <CardHeader>
        <CardTitle className="font-amiri text-center">
          {t("azkar.digital_tasbih")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Counters Display */}
        <div className={`flex items-center justify-center space-x-8 ${isRTL ? 'space-x-reverse' : ''}`}>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400 mb-2">
              {counts.tasbih}
            </div>
            <p className="text-emerald-100 font-amiri">سبحان الله</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400 mb-2">
              {counts.tahmid}
            </div>
            <p className="text-emerald-100 font-amiri">الحمد لله</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400 mb-2">
              {counts.takbir}
            </div>
            <p className="text-emerald-100 font-amiri">الله أكبر</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className={`grid grid-cols-3 gap-3`}>
            <Button
              onClick={() => incrementCount('tasbih')}
              className="gradient-gold text-white shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <span className="font-amiri">سبحان الله</span>
            </Button>
            <Button
              onClick={() => incrementCount('tahmid')}
              className="gradient-gold text-white shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <span className="font-amiri">الحمد لله</span>
            </Button>
            <Button
              onClick={() => incrementCount('takbir')}
              className="gradient-gold text-white shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <span className="font-amiri">الله أكبر</span>
            </Button>
          </div>

          <div className="flex space-x-4 justify-center">
            <Button 
              onClick={resetCounts}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <span className="material-symbols-outlined mr-2">refresh</span>
              {t("actions.reset")}
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-emerald-100 text-sm font-inter">
              {t("azkar.progress")}
            </span>
            <span className="text-amber-400 text-sm font-bold">
              {counts.tasbih + counts.tahmid + counts.takbir}/100
            </span>
          </div>
          <div className="w-full bg-emerald-800 rounded-full h-2">
            <div 
              className="gradient-gold h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((counts.tasbih + counts.tahmid + counts.takbir) / 100 * 100, 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
