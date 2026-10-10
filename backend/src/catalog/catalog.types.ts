import { PathCategory } from '../paths/path-category.enum';
import { PeakType } from '../peaks/peak-type.enum';

export interface CatalogRequirement {
    n: number; // numbering as printed in the book
    text: string;
}

export interface PathChapter {
    category: `${PathCategory}`;
    name: string;
}

export interface CatalogPath {
    code: string;
    category: `${PathCategory}`;
    number: number;
    name: string;
    description: string;
}

export interface CatalogPeak {
    code: string;
    type: `${PeakType}`;
    order: number;
    name: string;
    description: string;
}

export interface CatalogGuideDiploma {
    code: string;
    level: number;
    name: string;
    requirements: CatalogRequirement[];
}

export interface CatalogDiploma {
    code: string;
    number: number;
    name: string;
    intro: string | null;
    requirements: CatalogRequirement[];
}
