import PatchController from '../../assets/patch_game_controller.png';
import PatchTemple from '../../assets/patch_temple.png';
import PatchCorgi from '../../assets/patch_corgi.png';
import PatchAussie from '../../assets/patch_aus.png';
import type { BoardSide, PinConfig } from './types';

export const boardPins: Record<BoardSide, PinConfig[]> = {
  professional: [
    {
      id: 'temple',
      image: PatchTemple,
      size: 'md',
      initialRotate: -9,
      hoverRotate: -4,
      anchor: { left: 'clamp(28px, 8vw, 120px)', top: 'clamp(92px, 14vh, 124px)' },
      title: 'ICCV Oral Paper',
      eyebrow: 'Academia',
      subtitle: 'A Graph-Based Framework to Bridge Movies and Synopses',
      description: "Aligned 328 films' temporal segments to synopsis paragraphs through a graph-based pipeline and shipped supporting annotation tools.",
      bullets: ['ICCV oral presentation', 'React/Flask cross-platform annotator', 'Motion-energy preprocessing for segments and keyframes'],
      link: 'https://openaccess.thecvf.com/content_ICCV_2019/papers/Xiong_A_Graph-Based_Framework_to_Bridge_Movies_and_Synopses_ICCV_2019_paper.pdf',
      linkLabel: 'Paper',
    },
    {
      id: 'controller',
      image: PatchController,
      size: 'md',
      initialRotate: 12,
      hoverRotate: 6,
      anchor: { right: 'clamp(28px, 8vw, 112px)', top: 'clamp(100px, 15vh, 132px)' },
      title: 'Xbox + Microsoft',
      eyebrow: 'Professional',
      subtitle: 'Full Stack Developer / Azure Infra Dev',
      description: 'Built consumer store experiences and operated reliable commerce infrastructure across Microsoft and Xbox product surfaces.',
      bullets: ['Xbox consumer store experiences across platforms', 'Azure commerce billing pipelines and ETL systems', 'Reliability, performance, and polish for high-scale user flows'],
    },
  ],
  hobby: [
    {
      id: 'aussie',
      image: PatchAussie,
      size: 'lg',
      initialRotate: 7,
      hoverRotate: 2,
      anchor: { left: 'clamp(26px, 9vw, 138px)', bottom: 'clamp(74px, 10vh, 104px)' },
      title: 'KillStreak',
      eyebrow: 'College Project',
      subtitle: 'OpenGL MOBA with custom networking and physics',
      description: 'A CSE 125 team game with client-side rendering prediction, screen-to-world movement, and core multiplayer systems.',
      bullets: ['Custom coarse-mesh collision to optimize server tick rates', 'Abilities, economy, UI, and pre-match systems', 'Playable team demo with video showcase'],
      link: 'https://www.youtube.com/watch?v=7GEG_zKTBqk',
      linkLabel: 'Demo',
    },
    {
      id: 'corgi',
      image: PatchCorgi,
      size: 'lg',
      initialRotate: -8,
      hoverRotate: -2,
      anchor: { right: 'clamp(26px, 9vw, 132px)', bottom: 'clamp(74px, 10vh, 104px)' },
      title: 'VR + Interactive Projects',
      eyebrow: 'Hobby + College',
      subtitle: 'IRONMAN and A Happy Ending',
      description: 'Hands-on immersive projects spanning Oculus interaction, remote driving, and polished VR narrative design.',
      bullets: ['Unity/Oculus remote driving rig with RealSense and Jetson Nano', 'All-campus VR competition winner', 'Contextual event scripting and interaction design'],
      link: 'https://roar.berkeley.edu/',
      linkLabel: 'ROAR',
    },
  ],
};