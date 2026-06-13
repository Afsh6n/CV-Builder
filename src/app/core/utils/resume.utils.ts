import { Resume } from "../types/resume.types";


export function countFilledFields(resume: Resume): number {
    let count = 0;
    const p = resume.personalInfo;

    if (p.firstName?.trim()) count++;
    if (p.lastName?.trim()) count++;
    if (p.title?.trim()) count++;
    if (p.email?.trim()) count++;
    if (p.mobile?.trim() || p.phone?.trim()) count++;

    if (p.profilePhoto) count++;

    if (resume.summary?.trim()) count++;

    count += resume.workExperience.filter(w =>
        (w.company?.trim() && w.position?.trim()) ||
        (w.company?.trim() && w.startDate?.trim())
    ).length;

    count += resume.education.filter(e =>
        e.institution?.trim() && (e.field?.trim() || e.degree?.trim())
    ).length;

    count += resume.skills.filter(s => s.name?.trim()).length;
    count += resume.projects.filter(pr => pr.title?.trim()).length;
    count += resume.certificates.filter(c => c.title?.trim()).length;
    count += resume.languages.filter(l => l.name?.trim()).length;

    if (resume.careerInfo?.totalExperience?.trim()) count++;

    return count;
}

export function isResumeEmpty(resume: Resume): boolean {
    return countFilledFields(resume) === 0;
}

export function isEnoughDataForPreview(resume: Resume): boolean {
    return countFilledFields(resume) >= 8;
}