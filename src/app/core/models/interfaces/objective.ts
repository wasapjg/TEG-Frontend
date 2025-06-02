import { ObjectiveType } from "../../enums/objective-type";

export interface Objective {
  id: string;
  description: string;
  type: ObjectiveType;
  completed: boolean;
  progress: number; // Percentage of progress
  details: any; // Specific details depending on the objective type
}
