'use client';
import CheckpointStudio,{type CheckpointPreviewProps} from './CheckpointStudio';
import {kUnit1Checkpoint} from '@/app/data/checkpoints/k-unit-1-config';
export default function StoryGardenStudio(props:CheckpointPreviewProps){return <CheckpointStudio {...props} definition={kUnit1Checkpoint}/>;}
