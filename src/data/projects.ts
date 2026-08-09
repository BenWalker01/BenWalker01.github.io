export interface Project {
  title: string;
  description: string;
  tags?: string[];
  github?: string;
  live?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    title: 'Vatism Replay Map',
    description: 'Display (and replay) euroscope log files',
    tags: ['typescript', 'react'],
    github: 'https://github.com/BenWalker01/vatsim-replay-map',
    live: 'https://benwalker01.github.io/vatsim-replay-map/',
    featured: true,
  },
  {
    title: 'Simple CPU ray tracer',
    description: 'Following along with Ray Tracing in One Weekend',
    tags: ['c++'],
    github: 'https://github.com/BenWalker01/simple-ray-tracer',
    featured: true,
  },
  {
    title: 'Little Computer 3 VM',
    description: 'Emulator written in rust',
    tags: ['rust'],
    github: 'https://github.com/BenWalker01/lc3-vm',
    featured: true,
  },
  {
    title: 'Airport runway utilisation',
    description: 'Track arrival and departure rates over a given time',
    tags: ['Python'],
    github: 'https://github.com/BenWalker01/vatsim-airport-rates',
  },
  {
    title: 'vSMR',
    description: 'vSMR Maintainer',
    tags: ['c++'],
    github: 'https://github.com/VATSIM-UK/vSMR',
  },
  {
    title: 'FPN-68 Simulation',
    description: 'Simulation of an FPN-68 radar for euroscope',
    tags: ['c++'],
    github: 'https://github.com/BenWalker01/FPN-68',
  },
  {
    title: 'Rusty OS',
    description: 'Basics of an operating system written in rust',
    tags: ['rust', 'os'],
    github: 'https://github.com/BenWalker01/rusty-os',
  },
];
