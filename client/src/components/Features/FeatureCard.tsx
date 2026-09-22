import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  gradient: "emerald" | "gold" | "blue" | "purple" | "teal" | "pink";
  imageUrl?: string;
}

const gradientClasses = {
  emerald: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
  gold: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
  blue: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
  purple: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
  teal: "from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20",
  pink: "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20",
};

const iconBgClasses = {
  emerald: "bg-emerald-600",
  gold: "bg-amber-600",
  blue: "bg-blue-600",
  purple: "bg-purple-600",
  teal: "bg-teal-600",
  pink: "bg-pink-600",
};

const textClasses = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  gold: "text-amber-600 dark:text-amber-400",
  blue: "text-blue-600 dark:text-blue-400",
  purple: "text-purple-600 dark:text-purple-400",
  teal: "text-teal-600 dark:text-teal-400",
  pink: "text-pink-600 dark:text-pink-400",
};

export default function FeatureCard({ 
  title, 
  description, 
  icon, 
  href, 
  gradient,
  imageUrl 
}: FeatureCardProps) {
  const { t, isRTL } = useLanguage();

  return (
    <Link href={href}>
      <Card className={`group bg-gradient-to-br ${gradientClasses[gradient]} p-6 card-hover cursor-pointer overflow-hidden ${
        gradient === "emerald" ? "geometric-clip" : ""
      }`}>
        <CardContent className="p-0">
          <div className="mb-4">
            {imageUrl && (
              <div className="w-full h-32 mb-4 rounded-xl overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className={`${iconBgClasses[gradient]} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined text-white text-2xl">
                {icon}
              </span>
            </div>
          </div>
          
          <h3 className="text-xl font-amiri font-bold text-foreground mb-3">
            {title}
          </h3>
          
          <p className="text-muted-foreground font-inter mb-4 leading-relaxed">
            {description}
          </p>
          
          <div className={`flex items-center ${textClasses[gradient]} font-medium`}>
            <span>{t("actions.explore_now")}</span>
            <span className={`material-symbols-outlined ${isRTL ? 'mr-2 group-hover:-translate-x-1' : 'ml-2 group-hover:translate-x-1'} transition-transform`}>
              {isRTL ? 'arrow_back' : 'arrow_forward'}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
