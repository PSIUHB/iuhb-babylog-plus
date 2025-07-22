export enum MilestoneCategory {
  MOTOR_DEVELOPMENT = 'motorDevelopment',
  COMMUNICATION_LANGUAGE = 'communicationLanguage',
  COGNITIVE_DEVELOPMENT = 'cognitiveDevelopment',
  SOCIAL_EMOTIONAL = 'socialEmotional',
  SELF_CARE = 'selfCare',
  PHYSICAL_GROWTH = 'physicalGrowth'
}

export interface Milestone {
  category: MilestoneCategory;
  milestone: string;
  expectedAgeMonths: number;
  ageRangeMonths: [number, number]; // [min, max]
  achievedDate?: string; // ISO date string
}

// Predefined milestones by category
export const MILESTONES: Record<MilestoneCategory, Milestone[]> = {
  [MilestoneCategory.MOTOR_DEVELOPMENT]: [
    {
      milestone: "First smile (social)",
      expectedAgeMonths: 2,
      ageRangeMonths: [1, 3],
      category: MilestoneCategory.MOTOR_DEVELOPMENT
    },
    {
      milestone: "Holds head up during tummy time",
      expectedAgeMonths: 2,
      ageRangeMonths: [1, 4],
      category: MilestoneCategory.MOTOR_DEVELOPMENT
    },
    {
      milestone: "Rolls over (front to back, back to front)",
      expectedAgeMonths: 4,
      ageRangeMonths: [3, 6],
      category: MilestoneCategory.MOTOR_DEVELOPMENT
    },
    {
      milestone: "Sits without support",
      expectedAgeMonths: 6,
      ageRangeMonths: [4, 8],
      category: MilestoneCategory.MOTOR_DEVELOPMENT
    },
    {
      milestone: "Crawls or scoots",
      expectedAgeMonths: 8,
      ageRangeMonths: [6, 10],
      category: MilestoneCategory.MOTOR_DEVELOPMENT
    },
    {
      milestone: "Pulls to standing",
      expectedAgeMonths: 9,
      ageRangeMonths: [7, 12],
      category: MilestoneCategory.MOTOR_DEVELOPMENT
    },
    {
      milestone: "Walks with support (cruising)",
      expectedAgeMonths: 10,
      ageRangeMonths: [8, 12],
      category: MilestoneCategory.MOTOR_DEVELOPMENT
    },
    {
      milestone: "Takes first independent steps",
      expectedAgeMonths: 12,
      ageRangeMonths: [9, 15],
      category: MilestoneCategory.MOTOR_DEVELOPMENT
    },
    {
      milestone: "Runs",
      expectedAgeMonths: 18,
      ageRangeMonths: [15, 24],
      category: MilestoneCategory.MOTOR_DEVELOPMENT
    },
    {
      milestone: "Jumps with both feet",
      expectedAgeMonths: 24,
      ageRangeMonths: [20, 30],
      category: MilestoneCategory.MOTOR_DEVELOPMENT
    },
    {
      milestone: "Climbs stairs",
      expectedAgeMonths: 18,
      ageRangeMonths: [15, 24],
      category: MilestoneCategory.MOTOR_DEVELOPMENT
    },
    {
      milestone: "Pedals tricycle",
      expectedAgeMonths: 36,
      ageRangeMonths: [30, 42],
      category: MilestoneCategory.MOTOR_DEVELOPMENT
    },
    {
      milestone: "Hops on one foot",
      expectedAgeMonths: 48,
      ageRangeMonths: [42, 54],
      category: MilestoneCategory.MOTOR_DEVELOPMENT
    }
  ],
  [MilestoneCategory.COMMUNICATION_LANGUAGE]: [
    {
      milestone: "First laugh",
      expectedAgeMonths: 3,
      ageRangeMonths: [2, 5],
      category: MilestoneCategory.COMMUNICATION_LANGUAGE
    },
    {
      milestone: "Babbles (ba-ba, da-da sounds)",
      expectedAgeMonths: 6,
      ageRangeMonths: [4, 8],
      category: MilestoneCategory.COMMUNICATION_LANGUAGE
    },
    {
      milestone: "Says first word",
      expectedAgeMonths: 12,
      ageRangeMonths: [8, 15],
      category: MilestoneCategory.COMMUNICATION_LANGUAGE
    },
    {
      milestone: "Waves bye-bye",
      expectedAgeMonths: 9,
      ageRangeMonths: [7, 12],
      category: MilestoneCategory.COMMUNICATION_LANGUAGE
    },
    {
      milestone: "Points to objects",
      expectedAgeMonths: 10,
      ageRangeMonths: [8, 12],
      category: MilestoneCategory.COMMUNICATION_LANGUAGE
    },
    {
      milestone: "Says \"mama\" or \"dada\" meaningfully",
      expectedAgeMonths: 10,
      ageRangeMonths: [8, 13],
      category: MilestoneCategory.COMMUNICATION_LANGUAGE
    },
    {
      milestone: "Follows simple commands",
      expectedAgeMonths: 12,
      ageRangeMonths: [10, 15],
      category: MilestoneCategory.COMMUNICATION_LANGUAGE
    },
    {
      milestone: "Says 10+ words",
      expectedAgeMonths: 15,
      ageRangeMonths: [12, 18],
      category: MilestoneCategory.COMMUNICATION_LANGUAGE
    },
    {
      milestone: "Combines two words",
      expectedAgeMonths: 18,
      ageRangeMonths: [15, 24],
      category: MilestoneCategory.COMMUNICATION_LANGUAGE
    },
    {
      milestone: "Uses sentences of 3+ words",
      expectedAgeMonths: 24,
      ageRangeMonths: [20, 30],
      category: MilestoneCategory.COMMUNICATION_LANGUAGE
    },
    {
      milestone: "Asks \"what\" and \"where\" questions",
      expectedAgeMonths: 30,
      ageRangeMonths: [24, 36],
      category: MilestoneCategory.COMMUNICATION_LANGUAGE
    },
    {
      milestone: "Tells stories",
      expectedAgeMonths: 48,
      ageRangeMonths: [36, 60],
      category: MilestoneCategory.COMMUNICATION_LANGUAGE
    }
  ],
  [MilestoneCategory.COGNITIVE_DEVELOPMENT]: [
    {
      milestone: "Tracks objects with eyes",
      expectedAgeMonths: 2,
      ageRangeMonths: [1, 4],
      category: MilestoneCategory.COGNITIVE_DEVELOPMENT
    },
    {
      milestone: "Recognizes familiar faces",
      expectedAgeMonths: 3,
      ageRangeMonths: [2, 5],
      category: MilestoneCategory.COGNITIVE_DEVELOPMENT
    },
    {
      milestone: "Shows stranger anxiety",
      expectedAgeMonths: 8,
      ageRangeMonths: [6, 12],
      category: MilestoneCategory.COGNITIVE_DEVELOPMENT
    },
    {
      milestone: "Plays peek-a-boo",
      expectedAgeMonths: 9,
      ageRangeMonths: [7, 12],
      category: MilestoneCategory.COGNITIVE_DEVELOPMENT
    },
    {
      milestone: "Looks for hidden objects",
      expectedAgeMonths: 10,
      ageRangeMonths: [8, 12],
      category: MilestoneCategory.COGNITIVE_DEVELOPMENT
    },
    {
      milestone: "Imitates actions",
      expectedAgeMonths: 12,
      ageRangeMonths: [9, 15],
      category: MilestoneCategory.COGNITIVE_DEVELOPMENT
    },
    {
      milestone: "Sorts shapes or colors",
      expectedAgeMonths: 24,
      ageRangeMonths: [18, 30],
      category: MilestoneCategory.COGNITIVE_DEVELOPMENT
    },
    {
      milestone: "Pretend play begins",
      expectedAgeMonths: 18,
      ageRangeMonths: [15, 24],
      category: MilestoneCategory.COGNITIVE_DEVELOPMENT
    },
    {
      milestone: "Counts to 10",
      expectedAgeMonths: 48,
      ageRangeMonths: [36, 60],
      category: MilestoneCategory.COGNITIVE_DEVELOPMENT
    },
    {
      milestone: "Recognizes letters",
      expectedAgeMonths: 48,
      ageRangeMonths: [36, 60],
      category: MilestoneCategory.COGNITIVE_DEVELOPMENT
    },
    {
      milestone: "Writes own name",
      expectedAgeMonths: 60,
      ageRangeMonths: [48, 72],
      category: MilestoneCategory.COGNITIVE_DEVELOPMENT
    }
  ],
  [MilestoneCategory.SOCIAL_EMOTIONAL]: [
    {
      milestone: "Smiles responsively",
      expectedAgeMonths: 2,
      ageRangeMonths: [1, 3],
      category: MilestoneCategory.SOCIAL_EMOTIONAL
    },
    {
      milestone: "Shows affection",
      expectedAgeMonths: 6,
      ageRangeMonths: [4, 10],
      category: MilestoneCategory.SOCIAL_EMOTIONAL
    },
    {
      milestone: "Shows separation anxiety",
      expectedAgeMonths: 8,
      ageRangeMonths: [6, 12],
      category: MilestoneCategory.SOCIAL_EMOTIONAL
    },
    {
      milestone: "Plays alongside other children",
      expectedAgeMonths: 24,
      ageRangeMonths: [18, 30],
      category: MilestoneCategory.SOCIAL_EMOTIONAL
    },
    {
      milestone: "Shows defiant behavior",
      expectedAgeMonths: 18,
      ageRangeMonths: [15, 24],
      category: MilestoneCategory.SOCIAL_EMOTIONAL
    },
    {
      milestone: "Shows empathy",
      expectedAgeMonths: 24,
      ageRangeMonths: [18, 36],
      category: MilestoneCategory.SOCIAL_EMOTIONAL
    },
    {
      milestone: "Plays cooperatively with others",
      expectedAgeMonths: 36,
      ageRangeMonths: [30, 48],
      category: MilestoneCategory.SOCIAL_EMOTIONAL
    },
    {
      milestone: "Shows independence in dressing",
      expectedAgeMonths: 36,
      ageRangeMonths: [24, 48],
      category: MilestoneCategory.SOCIAL_EMOTIONAL
    },
    {
      milestone: "Shows pride in accomplishments",
      expectedAgeMonths: 24,
      ageRangeMonths: [18, 36],
      category: MilestoneCategory.SOCIAL_EMOTIONAL
    }
  ],
  [MilestoneCategory.SELF_CARE]: [
    {
      milestone: "Drinks from cup",
      expectedAgeMonths: 12,
      ageRangeMonths: [9, 15],
      category: MilestoneCategory.SELF_CARE
    },
    {
      milestone: "Feeds self with fingers",
      expectedAgeMonths: 9,
      ageRangeMonths: [7, 12],
      category: MilestoneCategory.SELF_CARE
    },
    {
      milestone: "Uses spoon/fork",
      expectedAgeMonths: 18,
      ageRangeMonths: [15, 24],
      category: MilestoneCategory.SELF_CARE
    },
    {
      milestone: "Brushes teeth independently",
      expectedAgeMonths: 48,
      ageRangeMonths: [36, 60],
      category: MilestoneCategory.SELF_CARE
    },
    {
      milestone: "Dresses self",
      expectedAgeMonths: 48,
      ageRangeMonths: [36, 60],
      category: MilestoneCategory.SELF_CARE
    }
  ],
  [MilestoneCategory.PHYSICAL_GROWTH]: [
    {
      milestone: "First tooth appears",
      expectedAgeMonths: 6,
      ageRangeMonths: [4, 12],
      category: MilestoneCategory.PHYSICAL_GROWTH
    }
  ]
};