import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProgress } from "../contexts/ProgressContext";
import { useLanguage } from "../contexts/LanguageContext";
import { ISLAMIC_KNOWLEDGE_DATA } from "../data/islamicKnowledgeData";

interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  readTime: number;
  tags: string[];
  content: string;
  relatedTopics: string[];
}

export default function IslamicKnowledgePage() {
  const { updateLastVisited, completeLesson } = useProgress();
  const { direction } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);

  useEffect(() => {
    updateLastVisited("/islamic-knowledge");
  }, [updateLastVisited]);

  const categories = [
    { id: "all", name: "الكل", icon: "category", count: ISLAMIC_KNOWLEDGE_DATA.length },
    { id: "aqeedah", name: "العقيدة", icon: "psychology", count: 0 },
    { id: "fiqh", name: "الفقه", icon: "gavel", count: 0 },
    { id: "hadith", name: "الحديث", icon: "format_quote", count: 0 },
    { id: "history", name: "التاريخ الإسلامي", icon: "history_edu", count: 0 },
    { id: "ethics", name: "الأخلاق والآداب", icon: "favorite", count: 0 },
    { id: "contemporary", name: "القضايا المعاصرة", icon: "public", count: 0 }
  ];

  // Calculate counts for each category
  categories.forEach(category => {
    if (category.id !== "all") {
      category.count = ISLAMIC_KNOWLEDGE_DATA.filter(item => item.category === category.id).length;
    }
  });

  const filteredItems = ISLAMIC_KNOWLEDGE_DATA.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleItemClick = (item: KnowledgeItem) => {
    setSelectedItem(item);
    completeLesson(`knowledge-${item.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "advanced": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "مبتدئ";
      case "intermediate": return "متوسط";
      case "advanced": return "متقدم";
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-6">
            <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">school</span>
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">موسوعة المعرفة الإسلامية</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-amiri font-bold text-gray-900 dark:text-white mb-4">
            المعرفة الإسلامية الشاملة
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-inter max-w-2xl mx-auto">
            استكشف كنوز المعرفة الإسلامية من العقيدة والفقه والتاريخ والأخلاق
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Input
                  placeholder="ابحث في المعرفة الإسلامية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${direction === "rtl" ? "text-right pr-12" : "text-left pl-12"}`}
                />
                <span className={`material-symbols-outlined absolute ${direction === "rtl" ? "right-4" : "left-4"} top-1/2 transform -translate-y-1/2 text-gray-400`}>
                  search
                </span>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700 shrink-0">
                <span className="material-symbols-outlined mr-2 rtl:ml-2">search</span>
                بحث
              </Button>
            </div>

            {/* Quick Search Tags */}
            <div className="flex flex-wrap gap-2">
              {["العقيدة", "الصلاة", "الزكاة", "الحج", "الأخلاق", "السيرة"].map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(tag)}
                  className="text-emerald-600 dark:text-emerald-400"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`h-auto p-4 ${
                selectedCategory === category.id 
                  ? "bg-emerald-600 text-white" 
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <div className="text-center w-full">
                <span className="material-symbols-outlined text-2xl mb-2 block">{category.icon}</span>
                <span className="font-amiri text-sm block">{category.name}</span>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {category.count}
                </Badge>
              </div>
            </Button>
          ))}
        </div>

        {/* Knowledge Cards Grid */}
        {!selectedItem ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="cursor-pointer card-hover"
                onClick={() => handleItemClick(item)}
              >
                <CardHeader>
                  <CardTitle className="font-amiri text-lg leading-relaxed">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 font-inter mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={getDifficultyColor(item.difficulty)}>
                      {getDifficultyText(item.difficulty)}
                    </Badge>
                    <Badge variant="outline" className="text-emerald-600">
                      {item.readTime} دقيقة
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>{item.readTime} دقائق</span>
                    </div>
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">
                      arrow_forward
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Selected Item Detail View */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedItem(null)}
                    className="text-emerald-600"
                  >
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">arrow_back</span>
                    العودة للقائمة
                  </Button>
                  
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(selectedItem.difficulty)}>
                      {getDifficultyText(selectedItem.difficulty)}
                    </Badge>
                    <Badge variant="outline" className="text-emerald-600">
                      {selectedItem.readTime} دقيقة
                    </Badge>
                  </div>
                </div>
                
                <CardTitle className="text-2xl md:text-3xl font-amiri text-emerald-700 dark:text-emerald-400 mb-4">
                  {selectedItem.title}
                </CardTitle>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 font-inter leading-relaxed">
                  {selectedItem.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedItem.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <div className="font-amiri text-lg leading-relaxed text-gray-900 dark:text-white whitespace-pre-line">
                    {selectedItem.content}
                  </div>
                </div>
                
                {/* Related Topics */}
                {selectedItem.relatedTopics.length > 0 && (
                  <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <h3 className="text-lg font-amiri font-bold text-emerald-700 dark:text-emerald-400 mb-4">
                      مواضيع ذات صلة
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.relatedTopics.map((topic) => (
                        <Button
                          key={topic}
                          variant="outline"
                          size="sm"
                          className="text-emerald-600 dark:text-emerald-400"
                        >
                          {topic}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">bookmark_add</span>
                    حفظ
                  </Button>
                  <Button variant="outline">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">share</span>
                    مشاركة
                  </Button>
                  <Button variant="outline" className="text-purple-600 border-purple-200">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">quiz</span>
                    اختبار الفهم
                  </Button>
                  <Button variant="outline">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">print</span>
                    طباعة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Links to Related Pages */}
        <Card className="mt-8 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30">
          <CardContent className="p-6">
            <h3 className="text-lg font-amiri font-bold text-gray-900 dark:text-white mb-4 text-center">
              اكتشف المزيد من المعرفة الإسلامية
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/five-pillars">
                <Button variant="outline" className="w-full h-auto p-4">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-2xl mb-2 block text-emerald-600">temple_buddhist</span>
                    <span className="font-amiri text-sm">أركان الإسلام</span>
                  </div>
                </Button>
              </Link>
              
              <Link href="/women-in-islam">
                <Button variant="outline" className="w-full h-auto p-4">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-2xl mb-2 block text-purple-600">female</span>
                    <span className="font-amiri text-sm">المرأة في الإسلام</span>
                  </div>
                </Button>
              </Link>
              
              <Link href="/seerah">
                <Button variant="outline" className="w-full h-auto p-4">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-2xl mb-2 block text-gold-600">account_circle</span>
                    <span className="font-amiri text-sm">السيرة النبوية</span>
                  </div>
                </Button>
              </Link>
              
              <Link href="/ai-assistant">
                <Button variant="outline" className="w-full h-auto p-4">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-2xl mb-2 block text-blue-600">psychology</span>
                    <span className="font-amiri text-sm">المساعد الذكي</span>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
