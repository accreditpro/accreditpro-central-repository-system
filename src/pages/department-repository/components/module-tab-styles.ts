// Shared active-tab / nav highlight styles for Dept Coordinator repository modules.
// Mirrors the Infrastructure Repository section-selection styling: the active
// tab gets a colored ring + colored icon using the module's theme color.
//
// Also exports color-tinted nav hover classes so every module's sidebar /
// section navigation uses the same hover treatment with its own theme color.

export interface ModuleTabActiveClasses {
  ring: string;
  icon: string;
  hover: string;
}

export interface ModuleNavClasses {
  active: string;
  inactive: string;
  icon: string;
}

const moduleTabActiveClasses: Record<string, ModuleTabActiveClasses> = {
  academic: { ring: 'ring-1 ring-violet-500/30', icon: 'text-violet-600', hover: 'hover:bg-violet-500/10 hover:text-violet-600' },
  faculty: { ring: 'ring-1 ring-indigo-500/30', icon: 'text-indigo-600', hover: 'hover:bg-indigo-500/10 hover:text-indigo-600' },
  student: { ring: 'ring-1 ring-emerald-500/30', icon: 'text-emerald-600', hover: 'hover:bg-emerald-500/10 hover:text-emerald-600' },
  research: { ring: 'ring-1 ring-pink-500/30', icon: 'text-pink-600', hover: 'hover:bg-pink-500/10 hover:text-pink-600' },
  alumni: { ring: 'ring-1 ring-teal-500/30', icon: 'text-teal-600', hover: 'hover:bg-teal-500/10 hover:text-teal-600' },
  'student-dev-outcomes': { ring: 'ring-1 ring-rose-500/30', icon: 'text-rose-600', hover: 'hover:bg-rose-500/10 hover:text-rose-600' },
  infrastructure: { ring: 'ring-1 ring-amber-500/30', icon: 'text-amber-600', hover: 'hover:bg-amber-500/10 hover:text-amber-600' },
  course: { ring: 'ring-1 ring-indigo-500/30', icon: 'text-indigo-600', hover: 'hover:bg-indigo-500/10 hover:text-indigo-600' },
};

const moduleNavClasses: Record<string, ModuleNavClasses> = {
  academic: {
    active: 'bg-violet-500/10 text-violet-600 font-medium hover:bg-violet-500/15 hover:text-violet-700',
    inactive: 'text-muted-foreground hover:bg-violet-500/10 hover:text-violet-600',
    icon: 'text-violet-600',
  },
  faculty: {
    active: 'bg-indigo-500/10 text-indigo-600 font-medium hover:bg-indigo-500/15 hover:text-indigo-700',
    inactive: 'text-muted-foreground hover:bg-indigo-500/10 hover:text-indigo-600',
    icon: 'text-indigo-600',
  },
  student: {
    active: 'bg-emerald-500/10 text-emerald-600 font-medium hover:bg-emerald-500/15 hover:text-emerald-700',
    inactive: 'text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600',
    icon: 'text-emerald-600',
  },
  research: {
    active: 'bg-pink-500/10 text-pink-600 font-medium hover:bg-pink-500/15 hover:text-pink-700',
    inactive: 'text-muted-foreground hover:bg-pink-500/10 hover:text-pink-600',
    icon: 'text-pink-600',
  },
  alumni: {
    active: 'bg-teal-500/10 text-teal-600 font-medium hover:bg-teal-500/15 hover:text-teal-700',
    inactive: 'text-muted-foreground hover:bg-teal-500/10 hover:text-teal-600',
    icon: 'text-teal-600',
  },
  'student-dev-outcomes': {
    active: 'bg-rose-500/10 text-rose-600 font-medium hover:bg-rose-500/15 hover:text-rose-700',
    inactive: 'text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600',
    icon: 'text-rose-600',
  },
  infrastructure: {
    active: 'bg-amber-500/10 text-amber-600 font-medium hover:bg-amber-500/15 hover:text-amber-700',
    inactive: 'text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600',
    icon: 'text-amber-600',
  },
  course: {
    active: 'bg-indigo-500/10 text-indigo-600 font-medium hover:bg-indigo-500/15 hover:text-indigo-700',
    inactive: 'text-muted-foreground hover:bg-indigo-500/10 hover:text-indigo-600',
    icon: 'text-indigo-600',
  },
  // App-wide default (primary tint) for generic shells & single-tone modules.
  primary: {
    active: 'bg-primary/10 text-primary font-medium hover:bg-primary/15',
    inactive: 'text-muted-foreground hover:bg-primary/10 hover:text-primary',
    icon: 'text-primary',
  },
};

export const getModuleTabActiveClasses = (moduleId: string): ModuleTabActiveClasses =>
  moduleTabActiveClasses[moduleId] || {
    ring: 'ring-1 ring-primary/30',
    icon: 'text-primary',
    hover: 'hover:bg-primary/10 hover:text-primary',
  };

export const getModuleNavClasses = (moduleId: string): ModuleNavClasses =>
  moduleNavClasses[moduleId] || moduleNavClasses.primary;
