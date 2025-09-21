import { createSyncFn } from "unasync";
import MathJaxWorker from './mathjax.worker';

type Tex2SvgFunction = (math: string, argv?: { display?: boolean }) => string;

export const tex2svg: Tex2SvgFunction = createSyncFn(MathJaxWorker());