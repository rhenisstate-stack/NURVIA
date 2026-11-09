"use client";

import * as React from "react";
import { QuestionRendererProps } from "./types";
import { SingleChoiceRenderer } from "./SingleChoiceRenderer";
import { MultipleResponseRenderer } from "./MultipleResponseRenderer";
import { TrueFalseRenderer } from "./TrueFalseRenderer";
import { FillInTheBlankRenderer } from "./FillInTheBlankRenderer";
import { NumericCalculationRenderer } from "./NumericCalculationRenderer";
import { OrderedResponseRenderer } from "./OrderedResponseRenderer";
import { MatchingRenderer } from "./MatchingRenderer";
import { MatrixGridRenderer } from "./MatrixGridRenderer";
import { CaseStudyRenderer } from "./CaseStudyRenderer";
import { BowTieRenderer } from "./BowTieRenderer";
import { MultipleTrueFalseRenderer } from "./MultipleTrueFalseRenderer";
import { ImageBasedRenderer } from "./ImageBasedRenderer";
import { MultipleImageSelectionRenderer } from "./MultipleImageSelectionRenderer";
import { DragAndDropRenderer } from "./DragAndDropRenderer";
import { ExtendedResponseRenderer } from "./ExtendedResponseRenderer";
import { TabularResponseRenderer } from "./TabularResponseRenderer";
import { ShortAnswerRenderer } from "./ShortAnswerRenderer";

export const QuestionRendererRegistry: React.FC<QuestionRendererProps> = (props) => {
  const { question } = props;
  const rawType = question.questionType;

  // Normalize string or enum integer
  const typeKey = typeof rawType === "string" ? rawType.toLowerCase() : String(rawType);

  switch (typeKey) {
    // 1. Single Choice MCQ
    case "1":
    case "18":
    case "singlechoice":
    case "multiplechoice":
      return <SingleChoiceRenderer {...props} />;

    // 2 & 3. Multiple Choice / SATA
    case "2":
    case "multipleresponse":
    case "selectallthatapply":
    case "sata":
      return <MultipleResponseRenderer {...props} />;

    // 15. True / False
    case "3":
    case "truefalse":
      return <TrueFalseRenderer {...props} />;

    // 12. Fill in the Blank / Cloze
    case "4":
    case "fillintheblank":
    case "cloze":
      return <FillInTheBlankRenderer {...props} />;

    // 14. Numeric Calculation
    case "5":
    case "numericresponse":
    case "numericcalculation":
      return <NumericCalculationRenderer {...props} />;

    // 8. Ordered Response
    case "6":
    case "orderedresponse":
      return <OrderedResponseRenderer {...props} />;

    // 11. Matching
    case "7":
    case "matching":
      return <MatchingRenderer {...props} />;

    // 13. Matrix / Grid
    case "8":
    case "matrixgrid":
      return <MatrixGridRenderer {...props} />;

    // 9. Unfolding Case Study
    case "9":
    case "clinicalcasestudy":
    case "unfoldingcasestudy":
      return <CaseStudyRenderer {...props} />;

    // 18. Dynamic Lab / Bow-Tie
    case "10":
    case "bowtie":
    case "dynamiclabbowtie":
      return <BowTieRenderer {...props} />;

    // 4. Multiple True/False Checkbox
    case "11":
    case "multipletruefalse":
      return <MultipleTrueFalseRenderer {...props} />;

    // 5. Image-Based (Exhibit / Hotspot)
    case "12":
    case "imagebased":
      return <ImageBasedRenderer {...props} />;

    // 6. Multiple-Image Selection
    case "13":
    case "multipleimageselection":
      return <MultipleImageSelectionRenderer {...props} />;

    // 7. Drag-and-Drop (Bucket Classification)
    case "14":
    case "draganddrop":
      return <DragAndDropRenderer {...props} />;

    // 10. Extended Response / Essay
    case "15":
    case "extendedresponse":
      return <ExtendedResponseRenderer {...props} />;

    // 16. Tabular Response
    case "16":
    case "tabularresponse":
      return <TabularResponseRenderer {...props} />;

    // 17. Short Answer
    case "17":
    case "shortanswer":
      return <ShortAnswerRenderer {...props} />;

    default:
      // Fallback to SingleChoiceRenderer
      return <SingleChoiceRenderer {...props} />;
  }
};
