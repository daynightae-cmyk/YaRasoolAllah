import { useLanguage } from "../../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { LegacyIcon } from "@/components/common/LegacyIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Language = "ar" | "en" | "fr" | "ur";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: "ar", name: "Arabic", nativeName: "العربية" },
    { code: "en", name: "English", nativeName: "English" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "ur", name: "Urdu", nativeName: "اردو" },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center space-x-2 rtl:space-x-reverse bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
        >
          <LegacyIcon name="language" className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium hidden sm:inline">
            {currentLanguage?.nativeName || "عربي"}
          </span>
          <LegacyIcon name="expand_more" className="text-gray-500 dark:text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center justify-between cursor-pointer ${
              language === lang.code 
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" 
                : ""
            }`}
          >
            <div className="flex flex-col">
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</span>
            </div>
            {language === lang.code && (
              <LegacyIcon name="check" className="text-emerald-600 dark:text-emerald-400 text-sm" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
