export interface KnowledgeItem {
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

export const ISLAMIC_KNOWLEDGE_DATA: KnowledgeItem[] = [];
