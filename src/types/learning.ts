import { Chapter, Subchapter } from "@/services/courseStructureService";

export interface ExtendedChapter extends Chapter {
  videoUrl?: string;
}

export interface ExtendedSubchapter extends Subchapter {
  studyMaterialUrl?: string;
}
